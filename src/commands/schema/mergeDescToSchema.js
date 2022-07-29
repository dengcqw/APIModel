
function traverse(jsonObj, map) {
    if( jsonObj !== null && typeof jsonObj == "object" ) {
        Object.entries(jsonObj).forEach(([key, value]) => {
            // key is either an array index or object key
          if (key == "properties") {
            Object.entries(value).forEach(([key, value]) => {
              if (map[key] !== undefined) {
                value["description"] = map[key]
              }
            })
          } else if (typeof key == "string") {
            traverse(value, map)
          }
        });
    } else {
        // jsonObj is a number or string
    }
}


const merge = function(desc, schema) {
  let properties = desc['properties']
  var nameDescMap = {}
  for (let i = 0, len = properties.length; i < len; i++) {
    let prop = properties[i]
    nameDescMap[prop['name']] = prop['description']
  }

  traverse(schema, nameDescMap)
  return schema
}

module.exports = merge
