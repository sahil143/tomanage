import { HttpClient } from '../utils/httpClient';
import { TaskResponse, CreateTaskRequest, UpdateTaskRequest } from '../types/api';
import { TickTickTask } from '../types/ticktick';
import { ProjectsService } from '../projects/ProjectsService';

export class TasksService {
  private httpClient: HttpClient;
  private projectsService: ProjectsService;

  constructor(httpClient: HttpClient, projectsService: ProjectsService) {
    this.httpClient = httpClient;
    this.projectsService = projectsService;
  }

  /**
   * Get all tasks from TickTick (from all projects)
   */
  async getAll(): Promise<TickTickTask[]> {
    // Get all projects first
    const projects = await this.projectsService.getAll();

    // Get tasks from all projects
    const allTasks: TickTickTask[] = [];
    for (const project of projects) {
      const projectData = await this.projectsService.getWithData(project.id);
      if (projectData.tasks && Array.isArray(projectData.tasks)) {
        allTasks.push(...projectData.tasks);
      }
    }

    return allTasks;
  }

  /**
   * Get a single task by project ID and task ID
   */
  async get(projectId: string, taskId: string): Promise<TickTickTask> {
    const response = await this.httpClient.get<TaskResponse>(`/project/${projectId}/task/${taskId}`);
    return response.data;
  }

  /**
   * Create a new task in TickTick
   */
  async create(task: CreateTaskRequest): Promise<TickTickTask> {
    const response = await this.httpClient.post<TaskResponse>('/task', task);
    return response.data;
  }

  /**
   * Update an existing task in TickTick
   */
  async update(ticktickId: string, updates: UpdateTaskRequest): Promise<TickTickTask> {
    const response = await this.httpClient.post<TaskResponse>(
      `/task/${ticktickId}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete a task from TickTick
   */
  async delete(ticktickId: string): Promise<void> {
    await this.httpClient.delete(`/task/${ticktickId}`);
  }

  /**
   * Mark a task as completed in TickTick
   * Note: Requires both projectId and taskId according to official API spec
   */
  async complete(projectId: string, taskId: string): Promise<void> {
    await this.httpClient.post(`/project/${projectId}/task/${taskId}/complete`, {});
  }
}
