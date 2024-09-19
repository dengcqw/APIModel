/*
 * 1. 把下面js代码注入RAP接口页面，
 * 2. 设置请求方法theMethod 和 接口方法名theTopName
 * 3. 调用printObj输出内容，再拷贝到项目中
 */

// 在RAP页面注入函数用于生成api方法
function genRequest(obj) {
  const REQUEST = obj.topName
  const DESC = obj.module + '-' + obj.name
  const URL = obj.url
  const METHOD = obj.method
  const reqName = METHOD.toLowerCase() + REQUEST

  return `export const ${reqName} = (params: ${REQUEST}Params): Promise<RespDataType<${REQUEST}Data>> => { return APIClient.simpleRequest({ url: '${URL}', method: '${METHOD}', desc: '${DESC}', body: params }) }`
}

function genImport(obj) {
  const REQUEST = obj.topName
  return `import { ${REQUEST}, ${REQUEST}Params } from "../Models/${REQUEST}"`
}

// 在RAP页面注入函数用于打印API方法
function printApi(apiName) {

  const liElements = $('.summary').getElementsByTagName('li')

  let obj = {
    id: liElements[0].innerText.split('：')[1],
    url: liElements[1].innerText.split('：')[1],
    method:liElements[2].innerText.split('：')[1],
    name: $('.InterfaceSummary .header .title').innerText,
    module: $('.ModuleList .active').textContent,
    topName: apiName,
  }
  let req = genRequest(obj);
  let imp = genImport(obj);

  return `
${JSON.stringify(obj)}
${req}
${imp}
`
}
