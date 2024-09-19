
function traverse(jsonObj: any, map: any) {
  if (jsonObj !== null && typeof jsonObj == 'object') {
    // 由json 生成 schema，所以下面字段有值
    if (jsonObj.required != undefined) {
      jsonObj.required = undefined
    }
    if (jsonObj.additionalProperties != undefined) {
      jsonObj.additionalProperties = undefined
    }

    Object.entries(jsonObj).forEach(([key, value]) => {
      // key is either an array index or object key
      if (key == 'required') {
      } else if (key == 'properties') {
        Object.entries(value).forEach(([key, value]) => {
          if (map[key] !== undefined) {
            value.description = map[key]
          }
        })
      } else if (typeof key == 'string') {
        traverse(value, map)
      }
    })
  } else {
    // jsonObj is a number or string
  }
}

export const merge = function (desc: any, schema: any): any {
  if (desc == null || schema == null) return undefined
  // 生成字段和描述的字典
  let properties = desc['properties']
  var nameDescMap = {}
  for (let i = 0, len = properties.length; i < len; i++) {
    let prop = properties[i]
    nameDescMap[prop['name']] = prop['description']
  }

  traverse(schema, nameDescMap)
  return schema
}
