import { Command, Flags } from '@oclif/core'
import BatchGenerateImpl, { ConfigType } from '../../BatchGenerateImpl'
const jsonfile = require('jsonfile')
import * as Path from 'path'

export default class BatchGenerate extends Command {
  static description = 'generate from config list'

  static examples = [
    `APIModel batchgenerate --config [api.json] --cookie [acookie]  --lang dart [outputdir]`,
    `config format: [{id, topName, name}]`
  ]

  static flags = {
    config: Flags.string({ description: 'json文件，描述多个接口', required: true }),
    cookie: Flags.string({ description: '网页登陆的cookie', required: true }),
    lang: Flags.string({ description: '转换语言，参考quicktype', required: true })
  }

  static args = [{ name: 'output', description: '输出文件目录,json类型', required: true }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(BatchGenerate)
    let config = jsonfile.readFileSync(Path.resolve(flags.config as string)) as ConfigType
    BatchGenerateImpl(config, flags.cookie, args.output, flags.lang)
  }
}
