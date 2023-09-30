import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { AuthorizedTeamsData, zodAuthorizedTeamsData } from '../types/zodAuthorizedTeams'
import { WorkspacePlanData, zodWorkspacePlanData } from '../types/zodWorkspacePlanData'
import { WorkspaceSeatsData, zodWorkspaceSeatsData } from '../types/zodWorkspaceSeatsData'

export type GetAuthorizedTeams = {
  success: true
  data: AuthorizedTeamsData
} | ApiErrors

export type GetWorkspaceSeats = {
  success: true
  data: WorkspaceSeatsData
} | ApiErrors

export type GetWorkspacePlan = {
  success: true
  data: WorkspacePlanData
} | ApiErrors

export class TeamsWorkspaces {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getAuthorizedTeams (): Promise<GetAuthorizedTeams> {
    const url = 'https://api.clickup.com/api/v2/team'
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodAuthorizedTeamsData
    console.log(`TeamsWorkspaces getData: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }

  async getTeamWorkspaceSeats (teamId: string): Promise<GetWorkspaceSeats> {
    const url = `https://api.clickup.com/api/v2/team/${teamId}/seats`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodWorkspaceSeatsData
    console.log(`TeamsWorkspaces getData: teamId: ${teamId}`)
    console.log(`TeamsWorkspaces getData: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }

  async getWorkspacePlan (teamId: string): Promise<GetWorkspacePlan> {
    const url = `https://api.clickup.com/api/v2/team/${teamId}/plan`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodWorkspacePlanData
    console.log(`TeamsWorkspaces getData: teamId: ${teamId}`)
    console.log(`TeamsWorkspaces getData: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }
}
