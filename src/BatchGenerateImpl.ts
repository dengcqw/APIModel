import GenerateCode from './GenerateCode'

export type ConfigType = {
  id: string
  topName: string
}[]

const BatchGenerateXXX = (config: ConfigType, cookie: string, outputdir: string, lang: string): void => {
  config.forEach(value => {
    console.log('----> generate', value.id, value.topName)
    GenerateCode(value.id, cookie, value.topName, outputdir, lang)
  })
}

export default BatchGenerateXXX
