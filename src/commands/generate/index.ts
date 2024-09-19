import {Command, Flags} from '@oclif/core'
import BatchGenerateImpl from '../../BatchGenerateImpl'

export default class Generate extends Command {
  static description = 'Generate api model from RAP2操作平台'

  static examples = [
    `APIModel generate --id 123 --cookie acookie --topName Classname --lang dart [outputdir]`,
  ]

  static flags = {
    id: Flags.string({description: '接口ID', required: true}),
    cookie: Flags.string({description: '网页登陆的cookie', required: true}),
    topName: Flags.string({description: '顶层类名', required: true}),
    lang: Flags.string({description: '转换语言，参考quicktype', required: true}),
  }

  static args = [{name: 'output', description: '输出文件目录,json类型', required: true}]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Generate)

    BatchGenerateImpl([{id: flags.id, topName: flags.topName}], flags.cookie, args.output, flags.lang)
  }
}
