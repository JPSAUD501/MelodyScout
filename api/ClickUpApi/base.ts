import { Attachments } from './classes/attachments'
import { Comments } from './classes/comments'
import { CustomFields } from './classes/customFields'
import { Folders } from './classes/folders'
import { Lists } from './classes/lists'
import { Tags } from './classes/tags'
import { Tasks } from './classes/tasks'
import { TeamsWorkspaces } from './classes/teamWorkspaces'

export class ClickUpApi {
  private readonly apiToken: string

  public readonly tasks: Tasks
  public readonly customFields: CustomFields
  public readonly attachments: Attachments
  public readonly comments: Comments
  public readonly lists: Lists
  public readonly folders: Folders
  public readonly teamWorkspaces: TeamsWorkspaces
  public readonly tags: Tags

  constructor (token: string) {
    this.apiToken = token

    this.tasks = new Tasks(this.apiToken)
    this.customFields = new CustomFields(this.apiToken)
    this.attachments = new Attachments(this.apiToken)
    this.comments = new Comments(this.apiToken)
    this.lists = new Lists(this.apiToken)
    this.folders = new Folders(this.apiToken)
    this.teamWorkspaces = new TeamsWorkspaces(this.apiToken)
    this.tags = new Tags(this.apiToken)
  }
}
