import { Preview } from './classes/preview'
import { Search } from './classes/search'

export class MsSoundcloudApi {
  public search: Search
  public preview: Preview

  constructor () {
    this.search = new Search()
    this.preview = new Preview(this.search)
  }
}
