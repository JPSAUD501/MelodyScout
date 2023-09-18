import { Search } from './classes/search'

export class MsDeezerApi {
  public search: Search

  constructor () {
    this.search = new Search()
  }
}
