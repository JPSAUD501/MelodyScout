import { Authenticate } from './classes/authenticate'
import { Preview } from './classes/preview'
import { Search } from './classes/search'

export class MsSoundcloudApi {
  public authenticate: Authenticate
  public search: Search
  public preview: Preview

  constructor () {
    this.authenticate = new Authenticate()
    this.search = new Search(this.authenticate)
    this.preview = new Preview(this.authenticate, this.search)
  }
}
