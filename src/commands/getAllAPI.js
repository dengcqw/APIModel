let modules = allapi['data']['modules']

let apiconfig = []
modules.forEach(module => {
  let moduleName = module.name
  module.interfaces.forEach(api => {
      apiconfig.push({
        id: api.id,
        name: api.name,
        url: api.url,
        method: api.method,
        module: moduleName,
      })
  })
})

apiconfig.forEach(e => {
  try {
    let topName = ''
    if (e.url.includes('v1/')) {
      topName = e.url.split('v1/')[1].split("/").map(e => e.charAt(0).toUpperCase() + e.slice(1)).join('')
    } else {
      topName = e.url.split("/").map(e => e.charAt(0).toUpperCase() + e.slice(1)).join('')
    }
    e.topName = topName
    e.topName = e.topName.split('-').map(e => e.charAt(0).toUpperCase() + e.slice(1)).join('')
  } catch (error) {
    console.log('process', e.name)
  }
})
