import {Command, Flags} from '@oclif/core'
import GenerateSchema from './GenerateSchema'

export default class Hello extends Command {
  static description = 'Generate schema from RAP2操作平台'

  static examples = [
    `APIModel schema --id 123 --cookie aljkjlsdf  output.json`,
  ]

  static flags = {
    id: Flags.string({description: '接口ID', required: true}),
    cookie: Flags.string({description: '网页登陆的cookie', required: true})
  }

  static args = [{name: 'output', description: '输出文件,json类型', required: true}]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Hello)
    let schema = GenerateSchema(flags.id, flags.cookie)
    // write to file
  }
}
