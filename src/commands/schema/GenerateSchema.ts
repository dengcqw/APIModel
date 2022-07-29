import axios from "axios";
import * as fs from "fs";
import * as Path from "path";
import tempfile from "temping";
import { quicktypeJSON, quicktypeJSONSchema } from "./quicktype";
const mergeDescToSchema = require("./mergeDescToSchema.js");

type DescDataType = {
  id: number;
  name: string;
  url: string;
  method: string;
  properties: {
    name: string;
    description: string;
  }[];
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
  console.log("----> properties length = ", properties.length)
  return { name, url, method, id, properties };
};

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

const schemaToCode = async (lang: string, name: any, schema: string): Promise<string> => {
  const { lines } = await quicktypeJSONSchema(lang, name, JSON.stringify(schema));
  //console.log("----> msg", lines)
  return lines.join('\n');
};

const writeFile = (content: any, filePath: string = ""): string => {
  let file = filePath == "" ? tempfile.path() : Path.resolve(filePath);
  let isStr = typeof content == 'string'
  fs.writeFile(file, isStr?content:JSON.stringify(content), function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("数据写入成功！");
  });
  return file;
};

const Generate = (id: string, cookie: string): any => {
  console.log("----> msg", id, cookie);

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
    let descData = extractDescription(responses[0].data);
    let descPath = writeFile(descData);
    let apiData = extractData(responses[1].data);
    let apiPath = writeFile(apiData);
    console.log("----> descPath", descPath);
    console.log("----> apiPath", apiPath);

    jsonToSchema(apiData, descData.name).then((schemaData) => {
      let schemaPath = writeFile(schemaData);
      console.log("----> schemaPath", schemaPath);
      let merged = mergeDescToSchema(descData, schemaData);
      let mergedPath = writeFile(merged);
      console.log("----> mergedPath", mergedPath);

      schemaToCode("swift", "test", merged).then((codeData) => {
        let codePath = writeFile(codeData);
        console.log("----> codePath", codePath);
      });
    });

  });

  return null;
};

//koa.sid=yBWfE_Cz_U88eYBs5Tde3WcONRWXISmx; koa.sid.sig=xfUUrQBQqx2-ykzKEiasrJlgkW0
export default Generate;
