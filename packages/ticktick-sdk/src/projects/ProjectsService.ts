import { HttpClient } from '../utils/httpClient';
import {
  ProjectResponse,
  ProjectDataResponse,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../types/api';
import { TickTickProject, TickTickProjectData } from '../types/ticktick';

export class ProjectsService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Get all projects from TickTick
   */
  async getAll(): Promise<TickTickProject[]> {
    const response = await this.httpClient.get<ProjectResponse[]>('/project');
    return response.data;
  }

  /**
   * Get a single project by ID
   */
  async get(projectId: string): Promise<TickTickProject> {
    const response = await this.httpClient.get<ProjectResponse>(`/project/${projectId}`);
    return response.data;
  }

  /**
   * Get project with all its data (tasks, columns, etc.)
   */
  async getWithData(projectId: string): Promise<TickTickProjectData> {
    const response = await this.httpClient.get<ProjectDataResponse>(`/project/${projectId}/data`);
    return response.data;
  }

  /**
   * Create a new project in TickTick
   */
  async create(project: CreateProjectRequest): Promise<TickTickProject> {
    const response = await this.httpClient.post<ProjectResponse>('/project', project);
    return response.data;
  }

  /**
   * Update an existing project in TickTick
   */
  async update(projectId: string, updates: UpdateProjectRequest): Promise<TickTickProject> {
    const response = await this.httpClient.post<ProjectResponse>(`/project/${projectId}`, updates);
    return response.data;
  }

  /**
   * Delete a project from TickTick
   */
  async delete(projectId: string): Promise<void> {
    await this.httpClient.delete(`/project/${projectId}`);
  }
}
