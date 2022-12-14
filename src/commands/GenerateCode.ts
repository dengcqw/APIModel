import axios from "axios";
import * as fs from "fs";
import * as Path from "path";
import tempfile from "temping";
import { quicktypeJSON, quicktypeJSONSchema } from "./quicktype";
const mergeDescToSchema = require("./mergeDescToSchema.js");

type DescPropType = {
    name: string;
    type: string;
    children?: DescPropType[]
}

type DescDataType = {
  id: number;
  name: string;
  url: string;
  method: string;
  properties: {
    name: string;
    description: string;
  }[];
  requestProperties: DescPropType[]
};

type DescRespType = {
  data: DescDataType;
};

const extractDescription = (resp: DescRespType): DescDataType => {
  let data = resp["data"];
  let name = data.name;
  let url = data.url;
  let method = data.method;
  let id = data.id;
  let properties = data.properties.map((obj) => {
    return {
      name: obj.name,
      description: obj.description,
    };
  });
  //console.log("----> properties length = ", properties.length)
  return { name, url, method, id, properties, requestProperties:[]};
};

const extractRequsetParams = (resp: DescPropType[]): object => {
  var params = {}
  resp.forEach((element) => {
      if (element.children && element.children.length) {
        // @ts-ignore
        params[element.name] = [extractRequsetParams(element.children)]
      } else {
        // @ts-ignore
        params[element.name] = ""
      }
  })
  return params
}

type APITemplateRespType = {
  code: number;
  data: any;
  fail: boolean;
  msg: string;
  succ: boolean;
};

const extractData = (resp: APITemplateRespType): any => {
  return resp.data;
};

const jsonToSchema = async (json: any, name: string): Promise<any> => {
  const { lines } = await quicktypeJSON("schema", name, JSON.stringify(json));
  //console.log("----> msg", lines)
  return JSON.parse(lines.join("\n"));
};

const schemaToCode = async (lang: string, name: any, schema: string, desc: DescDataType): Promise<string> => {
  const { lines } = await quicktypeJSONSchema(lang, name, JSON.stringify(schema), [desc.id + ". " + desc.name, desc.method + " " + desc.url]);
  //console.log("----> msg", lines)
  return lines.join('\n');
};

const writeFile = (content: any, filePath: string = ""): string => {
  let file = filePath == "" ? tempfile.path() : filePath;
  let isStr = typeof content == 'string'
  //console.log("----> string ", typeof content)
  //console.log("----> string ", JSON.stringify(content))
  fs.writeFile(file, isStr?content:JSON.stringify(content), function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("?????????????????????");
  });
  return file;
};

const Generate = (id: string, cookie: string, topName: string, dir: string, lang: string): any => {
  if (lang.length == 0) {
    throw Error("--lang ??????")
    return
  }
  const instance = axios.create({
    baseURL: "http://192.168.1.74:8080/",
    timeout: 10000,
    headers: {
      Cookie: cookie,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
    },
  });

  Promise.all([instance.get(`interface/get?id=${id}`), instance.get(`app/mock/template/${id}`)]).then((responses) => {
    console.log("----> response", responses[0].status);
    console.log("----> response", responses[1].status);
    let data = responses[0].data as DescRespType
    let descData = extractDescription(data);
    //let descPath = writeFile(descData);
    let apiData = extractData(responses[1].data);
    //let apiPath = writeFile(apiData);
    //console.log("----> descPath", descPath);
    //console.log("----> apiPath", apiPath);

    if (apiData) {
        jsonToSchema(apiData, topName).then((schemaData) => {
          //let schemaPath = writeFile(schemaData);
          //console.log("----> schemaPath", schemaPath);

          let merged = mergeDescToSchema(descData, schemaData);
          //let mergedPath = writeFile(merged);
          //console.log("----> mergedPath", mergedPath);

          schemaToCode(lang, topName, merged, descData).then((codeData) => {
            let suffix = lang == "typescript" ? "ts" : lang
            let codePath = writeFile(codeData, Path.resolve(dir).concat("/"+topName+"."+suffix));
            console.log("----> codePath", codePath);
          });
        });
    }
    let paramData = extractRequsetParams(data.data.requestProperties)
    //let paramPath = writeFile(paramData);
    //console.log("----> paramData", paramPath)
    if (paramData) {
        jsonToSchema(paramData, topName+"Params").then((schemaData) => {
            let merged = mergeDescToSchema(descData, schemaData);
            //let paramPath = writeFile(merged);
            //console.log("----> paramSchema", paramPath)
            schemaToCode(lang, topName+"Params", merged, descData).then((codeData) => {
                let suffix = lang == "typescript" ? "ts" : lang
                let codePath = writeFile(codeData, Path.resolve(dir).concat("/"+topName+"Params."+suffix));
                console.log("----> paramsCodePath", codePath);
            });
        });
    }
  });

  return null;
};

export default Generate;
