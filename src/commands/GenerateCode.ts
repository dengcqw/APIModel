//@ts-nocheck
import axios from 'axios'
import * as fs from 'fs'
import * as Path from 'path'
import tempfile from 'temping'
import { quicktypeJSON, quicktypeJSONSchema } from './quicktype'
const mergeDescToSchema = require('./mergeDescToSchema.js')

type DescPropType = {
  name: string
  type: string
  children?: DescPropType[]
  priority: number
}

type DescDataType = {
  id: number
  name: string
  url: string
  method: string
  properties: {
    name: string
    description: string
  }[]
}

type DescRespType = {
  data: DescDataType
  errMsg: string
}

const extractDescription = (resp: DescRespType): DescDataType => {
  let data = resp['data']
  let name = data.name
  let url = data.url
  let method = data.method
  let id = data.id
  let properties = data.properties.map(obj => {
    return {
      name: obj.name,
      description: obj.description
    }
  })
  return { name, url, method, id, properties }
}

const extractRequsetParams = (resp: DescPropType[]): object => {
  var params = {}
  resp.forEach(element => {
    if (element.children && element.children.length) {
      params[element.name] = [extractRequsetParams(element.children)]
    } else {
      params[element.name] = ''
    }
  })
  return params
}

const jsonToSchema = async (json: any, name: string): Promise<any> => {
  if (json == null) return undefined
  const { lines } = await quicktypeJSON('schema', name, JSON.stringify(json))
  return JSON.parse(lines.join('\n'))
}

const schemaToCode = async (lang: string, name: string, schema: any, desc: DescDataType): Promise<string> => {
  // 检查是不是基础类型
  if (schema == null) return `export type ${name} = void`
  let definitions = schema.definitions[name]
  if (definitions && definitions.properties == null) {
    if (definitions.type !== 'object') {
      return `export type ${name} = $(definitions.type)`
    }
  }
  let arrayType = schema.type ==='array' ? `export type ${name}Array = ${name}[]\n\n` : ''

  const { lines } = await quicktypeJSONSchema(lang, name, JSON.stringify(schema), [
    desc.id + '. ' + desc.name,
    desc.method + ' ' + desc.url
  ])
  // 修改indent
  return arrayType + lines.map(e => {
    if (e == null) return e
    let txt = e.replace(';', '')
    if (txt.startsWith('    ')) {
      return txt.slice(2)
    } else {
      return txt
    }
  }).join('\n')
}

/*
function isNotEmptyObject(data: any) {
  if (typeof data === 'object') {
    return Object.keys(data).length > 0
  }
  return false
}
*/

const writeFile = (content: any, filePath: string = ''): string => {
  let file = filePath == '' ? tempfile.path() : filePath
  let isStr = typeof content == 'string'
  // console.log("----> string ", typeof content)
  // console.log("----> string ", JSON.stringify(content))
  fs.writeFileSync(file, isStr ? content : JSON.stringify(content), { flag: 'a' })
  return file
}

const Generate = async (id: string, cookie: string, topName: string, dir: string, lang: string): Promise<void> => {
  if (lang.length == 0) {
    throw new Error('--lang 必填')
  }
  const instance = axios.create({
    baseURL: 'http://rap.jms.com:8080/',
    timeout: 10000,
    headers: {
      Cookie: cookie,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    }
  })

  await Promise.all([
    instance.get(`interface/get?id=${id}`), // 获取接口的完整数据（JSON）
    instance.get(`app/mock/data/${id}?scope=response`), // 获取单个接口数据的模板（JSON Schema）
    instance.get(`app/mock/data/${id}?scope=request`) // 获取单个接口参数的模板（JSON Schema）
  ]).then(async responses => {
    console.log(
      '----> API', topName,
      id,
      ', desc',
      responses[0].status,
      ', response',
      responses[1].status,
      ' request',
      responses[2].status
    )

    // 提取接口字段描述
    let data = responses[0].data as DescRespType
    if (data && data.errMsg != null) {
      console.error('---->', id, topName, data)
      return
    }
    let descData = extractDescription(data)
    /*console.log("----> descPath", writeFile(descData));*/

    let dataName = topName + 'Data'
    let paramsName = topName + 'Params'

    let dataMock = responses[1].data.data
    if (dataMock) {
      if (dataMock.ascs) dataMock.ascs = undefined
      if (dataMock.descs) dataMock.descs = undefined
      if (dataMock.maxId) dataMock.maxId = undefined
    }

    let responseSchema = await jsonToSchema(dataMock, dataName)
    // console.log("----> responseSchema", responseSchema ? writeFile(responseSchema) : '')
    responseSchema = mergeDescToSchema(descData, responseSchema)

    let paramsMock = responses[2].data
    let requestSchema = await jsonToSchema(paramsMock, paramsName)
    // console.log('----> requestSchema',requestSchema ? writeFile(requestSchema) : '')
    requestSchema = mergeDescToSchema(descData, requestSchema)

    let suffix = lang === 'typescript' ? 'ts' : lang
    let ignoreEslint = '/* eslint no-use-before-define: 0, @typescript-eslint/no-explicit-any: 0 */ \n\n'
    let dataCode = await schemaToCode(lang, dataName, responseSchema, descData)
    let paramCode = await schemaToCode(lang, paramsName, requestSchema, descData)
    let codePath = writeFile(ignoreEslint + paramCode + '\n' + dataCode, Path.resolve(dir).concat('/' + topName + '.' + suffix))
    // console.log('----> codePath', codePath)
  })
}

export default Generate
