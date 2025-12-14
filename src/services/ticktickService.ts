import axios, { AxiosInstance, isAxiosError } from 'axios';
import { encode as base64Encode } from 'base-64';
import { EnergyLevel, Priority, Todo, createTodo } from '../types/todo';
import { API_CONFIG, STORAGE_KEYS, TIMEOUTS } from '../utils/constants';
import { SecureStore } from '../utils/storage';

// TickTick API Types
interface TickTickProject {
  id: string;
  name: string;
  color?: string;
  closed?: boolean;
  groupId?: string;
  viewMode?: string;
  permission?: string;
  kind?: string;
}

interface TickTickTask {
  id: string;
  isAllDay?: boolean;
  projectId: string;
  title: string;
  content?: string;
  desc?: string;
  timeZone?: string;
  repeatFlag?: string;
  startDate?: string;
  dueDate?: string;
  reminders?: string[];
  priority?: number;
  status?: number;
  completedTime?: string;
  createdTime?: string;
  sortOrder?: number;
  tags?: string[];
  items?: TickTickSubtask[];
}

interface TickTickSubtask {
  id: string;
  status: number;
  title: string;
  sortOrder: number;
  startDate?: string;
  isAllDay?: boolean;
  timeZone?: string;
  completedTime?: string;
}

interface TickTickColumn {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
}

interface TickTickProjectData {
  project: TickTickProject;
  tasks: TickTickTask[];
  columns?: TickTickColumn[];
}

class TickTickService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.TICKTICK_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: TIMEOUTS.SYNC_REQUEST,
    });

    // Add request interceptor to attach token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Store access token in SecureStore
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.TICKTICK_TOKEN, token);
    } catch (error) {
      throw new Error(`Failed to store access token: ${error}`);
    }
  }

  /**
   * Retrieve access token from SecureStore
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.TICKTICK_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Exchange authorization code for access token
   * This is Step 3 of the OAuth flow
   * @param code - The authorization code received from TickTick
   * @param redirectUri - The same redirect URI used in the authorization request
   * @returns The access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      const { TICKTICK_CLIENT_ID, TICKTICK_CLIENT_SECRET, TICKTICK_OAUTH_URL } = API_CONFIG;

      if (!TICKTICK_CLIENT_ID || !TICKTICK_CLIENT_SECRET) {
        throw new Error('TickTick client ID or secret not configured');
      }

      // Create Basic Auth header
      const credentials = `${TICKTICK_CLIENT_ID}:${TICKTICK_CLIENT_SECRET}`;
      const base64Credentials = base64Encode(credentials);

      // Prepare form data
      const formData = new URLSearchParams({
        client_id: TICKTICK_CLIENT_ID,
        code,
        grant_type: 'authorization_code',
        scope: 'tasks:read tasks:write',
        redirect_uri: redirectUri,
      });

      const response = await axios.post(
        `${TICKTICK_OAUTH_URL}/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${base64Credentials}`,
          },
          timeout: TIMEOUTS.API_REQUEST,
        }
      );

      const { access_token } = response.data;

      if (!access_token) {
        throw new Error('No access token received from TickTick');
      }

      // Store the token
      await this.setAccessToken(access_token);

      return access_token;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`);
      }
      throw new Error(`Failed to exchange code for token: ${error}`);
    }
  }

  /**
   * Check if user is authenticated (has a valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Logout and clear the access token
   */
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TICKTICK_TOKEN);
    } catch (error) {
      console.error('Failed to clear access token:', error);
    }
  }

  /**
   * Get all tasks from TickTick (from all projects)
   */
  async getTasks(): Promise<Todo[]> {
    try {
      // Get all projects first
      const projects = await this.getProjects();

      // Get tasks from all projects
      const allTasks: Todo[] = [];
      for (const project of projects) {
        const projectData = await this.getProjectWithData(project.id);
        if (projectData.tasks && Array.isArray(projectData.tasks)) {
          const todos = projectData.tasks.map((task: any) => this.convertTickTickToTodo(task));
          allTasks.push(...todos);
        }
      }

      return allTasks;
    } catch (error) {
      throw new Error(`Failed to fetch tasks: ${error}`);
    }
  }

  /**
   * Get a single task by project ID and task ID
   */
  async getTask(projectId: string, taskId: string): Promise<Todo> {
    try {
      const response = await this.axiosInstance.get(`/project/${projectId}/task/${taskId}`);
      return this.convertTickTickToTodo(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch task ${taskId}: ${error}`);
    }
  }

  /**
   * Create a new task in TickTick
   */
  async createTask(todo: Partial<Todo>): Promise<Todo> {
    try {
      const ticktickData = this.convertTodoToTickTick(todo);
      const response = await this.axiosInstance.post('/task', ticktickData);
      return this.convertTickTickToTodo(response.data);
    } catch (error) {
      throw new Error(`Failed to create task: ${error}`);
    }
  }

  /**
   * Update an existing task in TickTick
   */
  async updateTask(
    ticktickId: string,
    todo: Partial<Todo>
  ): Promise<Todo> {
    try {
      const ticktickData = this.convertTodoToTickTick(todo);
      const response = await this.axiosInstance.post(
        `/task/${ticktickId}`,
        ticktickData
      );
      return this.convertTickTickToTodo(response.data);
    } catch (error) {
      throw new Error(`Failed to update task ${ticktickId}: ${error}`);
    }
  }

  /**
   * Delete a task from TickTick
   */
  async deleteTask(ticktickId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/task/${ticktickId}`);
    } catch (error) {
      throw new Error(`Failed to delete task ${ticktickId}: ${error}`);
    }
  }

  /**
   * Mark a task as completed in TickTick
   */
  async completeTask(ticktickId: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/task/${ticktickId}`, {
        status: 2, // 2 = completed in TickTick
      });
    } catch (error) {
      throw new Error(`Failed to complete task ${ticktickId}: ${error}`);
    }
  }

  /**
   * Get all projects from TickTick
   */
  async getProjects(): Promise<TickTickProject[]> {
    try {
      const response = await this.axiosInstance.get('/project');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error}`);
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<TickTickProject> {
    try {
      const response = await this.axiosInstance.get(`/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch project ${projectId}: ${error}`);
    }
  }

  /**
   * Get project with all its data (tasks, columns, etc.)
   */
  async getProjectWithData(projectId: string): Promise<TickTickProjectData> {
    try {
      const response = await this.axiosInstance.get(`/project/${projectId}/data`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch project data for ${projectId}: ${error}`);
    }
  }

  /**
   * Convert TickTick task format to our Todo type
   */
  convertTickTickToTodo(data: TickTickTask): Todo {
    // Extract energy and duration from tags
    let energyRequired: EnergyLevel | undefined;
    let estimatedDuration: number | undefined;

    const tags: string[] = data.tags || [];
    const regularTags: string[] = [];

    tags.forEach((tag: string) => {
      if (tag.startsWith('energy:')) {
        const energy = tag.replace('energy:', '') as EnergyLevel;
        if (['low', 'medium', 'high'].includes(energy)) {
          energyRequired = energy;
        }
      } else if (tag.startsWith('duration:')) {
        const duration = parseInt(tag.replace('duration:', ''), 10);
        if (!isNaN(duration)) {
          estimatedDuration = duration;
        }
      } else {
        regularTags.push(tag);
      }
    });

    return createTodo({
      id: data.id,
      title: data.title || '',
      description: data.content,
      completed: data.status === 2,
      priority: this.reversePriority(data.priority || 0),
      tags: regularTags,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: data.createdTime ? new Date(data.createdTime) : new Date(),
      completedAt: data.completedTime
        ? new Date(data.completedTime)
        : undefined,
      energyRequired,
      estimatedDuration,
      ticktickId: data.id,
      ticktickProjectId: data.projectId,
      synced: true,
    });
  }

  /**
   * Convert our Todo type to TickTick task format
   */
  convertTodoToTickTick(todo: Partial<Todo>): any {
    const tags: string[] = [...(todo.tags || [])];

    // Encode energy level into tags
    if (todo.energyRequired) {
      tags.push(`energy:${todo.energyRequired}`);
    }

    // Encode duration into tags
    if (todo.estimatedDuration) {
      tags.push(`duration:${todo.estimatedDuration}`);
    }

    return {
      title: todo.title || '',
      content: todo.description || '',
      priority: todo.priority ? this.mapPriority(todo.priority) : 0,
      status: todo.completed ? 2 : 0,
      tags,
      dueDate: todo.dueDate?.toISOString(),
    };
  }

  /**
   * Map our Priority type to TickTick priority number
   * Our format: 'none' | 'low' | 'medium' | 'high'
   * TickTick format: 0 (none), 1 (low), 3 (medium), 5 (high)
   */
  mapPriority(priority: Priority): number {
    const priorityMap: Record<Priority, number> = {
      none: 0,
      low: 1,
      medium: 3,
      high: 5,
    };
    return priorityMap[priority];
  }

  /**
   * Map TickTick priority number to our Priority type
   * TickTick format: 0 (none), 1 (low), 3 (medium), 5 (high)
   * Our format: 'none' | 'low' | 'medium' | 'high'
   */
  reversePriority(priority: number): Priority {
    if (priority === 0) return 'none';
    if (priority === 1) return 'low';
    if (priority === 3) return 'medium';
    if (priority >= 5) return 'high';
    return 'none'; // Default fallback
  }
}


export const ticktickService = new TickTickService();
