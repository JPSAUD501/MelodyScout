import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { TaskData, zodTaskData } from '../types/zodTaskData'
import { TasksData, zodTasksDataResponse } from '../types/zodTasksData'

export type GetTasksResponse = {
  success: true
  data: TasksData
} | ApiErrors

export type GetTaskResponse = {
  success: true
  data: TaskData
} | ApiErrors

export type UpdateTaskResponse = {
  success: true
  data: TaskData
} | ApiErrors

export type CreateTaskResponse = {
  success: true
  data: TaskData
} | ApiErrors

export class Tasks {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getTasks (listId: string, pages: number): Promise<GetTasksResponse> {
    const partialTasks: TasksData[] = []
    const clickUpApiFetchPromises: Array<Promise<GetTasksResponse>> = []
    for (let i = 0; i < pages; i++) {
      const url = `https://api.clickup.com/api/v2/list/${listId}/task?page=${i}`
      const method = 'GET'
      const headers = {
        'Content-Type': 'application/json',
        Authorization: this.apiKey
      }
      const data = undefined
      const zodObject = zodTasksDataResponse
      console.log(`Tasks getInfo: listId: ${listId}`)
      console.log(`Tasks getInfo: url: ${url}`)
      clickUpApiFetchPromises.push(ClickUpApiFetch(url, method, headers, data, zodObject))
    }
    const clickUpApiFetchResponses = await Promise.all(clickUpApiFetchPromises)
    clickUpApiFetchResponses.forEach(clickUpApiFetchResponse => {
      if (!clickUpApiFetchResponse.success) {
        return clickUpApiFetchResponse
      }
      partialTasks.push(zodTasksDataResponse.parse(clickUpApiFetchResponse.data))
    })

    const tasks: TasksData = {
      tasks: []
    }
    partialTasks.forEach(partialTask => {
      tasks.tasks.push(...partialTask.tasks)
    })

    return {
      success: true,
      data: tasks
    }
  }

  async updateTask (taskId: string, newTaskData: TaskData, assignees?: {
    add: number[]
    rem: number[]
  }): Promise<UpdateTaskResponse> {
    const url = `https://api.clickup.com/api/v2/task/${taskId}`
    const method = 'PUT'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = {
      name: newTaskData.name,
      description: newTaskData.description,
      status: newTaskData.status.status,
      priority: newTaskData.priority,
      due_date: newTaskData.due_date,
      due_date_time: newTaskData.due_date !== null,
      parent: newTaskData.parent,
      time_estimate: newTaskData.time_estimate,
      start_date: newTaskData.start_date,
      start_date_time: newTaskData.start_date !== null,
      assignees: assignees ?? null,
      archived: newTaskData.archived
    }
    const zodObject = zodTaskData
    console.log(`Tasks updateInfo: taskId: ${taskId}`)
    console.log(`Tasks updateInfo: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }

  async getTask (taskId: string): Promise<GetTaskResponse> {
    const url = `https://api.clickup.com/api/v2/task/${taskId}`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodTaskData
    console.log(`Tasks getInfo: taskId: ${taskId}`)
    console.log(`Tasks getInfo: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }

  async createTask (listId: string, newTaskData: {
    name: string
    description?: string
    assignees?: number[]
    tags?: string[]
    status?: string
    priority?: number | null
    due_date?: number | null
    due_date_time?: boolean
    time_estimate?: number
    start_date?: number
    start_date_time?: boolean
    notify_all?: boolean
    parent?: string | null
    links_to?: string | null
    check_required_custom_fields?: boolean
    // custom_fields?: Array<{
    //   id: string
    //   value: number | string | null
    //   value_options?: {
    //     time: boolean
    //   }
    // }>
  }): Promise<CreateTaskResponse> {
    const url = `https://api.clickup.com/api/v2/list/${listId}/task`
    const method = 'POST'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = newTaskData
    const zodObject = zodTaskData
    console.log(`Tasks createInfo: listId: ${listId}`)
    console.log(`Tasks createInfo: url: ${url}`)
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
