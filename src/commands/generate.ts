import { Command, Flags } from '@oclif/core'
import BatchGenerateImpl, { ConfigType } from '../BatchGenerateImpl'
const jsonfile = require('jsonfile')
import * as Path from 'path'
import * as fs from 'fs'

export default class Generate extends Command {
  static description = '使用接口描述文件生成模型文件'

  static examples = [
    `APIModel generate --config [api.json] --cookie [acookie]  --lang dart [outputdir]`,
    `config format: [{id, topName, name}]`
  ]

  static flags = {
    config : Flags.string({ description : '接口描述文件路径，默认读取目录下apiconfig.json', default: './apiconfig.json', required : false }),
    cookie : Flags.string({ description : '网页登陆的cookie, 默认读取目录下cookie文件', required : false }),
    lang   : Flags.string({ description : '转换语言，参考quicktype, 默认typescript', default: 'typescript', required  : false })
  }

  static args = [{ name: 'output', description: '输出文件目录', required: true }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Generate)
    let config = jsonfile.readFileSync(Path.resolve(flags.config))
    let cookie = flags.cookie ?? fs.readFileSync(Path.resolve('./cookie')).toString().trim()
    BatchGenerateImpl(config, cookie, args.output, flags.lang)
  }
}
