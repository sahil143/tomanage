import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { EnergyLevel, Priority, Todo, createTodo } from '../types/todo';

const BASE_URL = 'https://api.ticktick.com/open/v1';
const TOKEN_KEY = 'ticktick_access_token';

class TickTickService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
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
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      throw new Error(`Failed to store access token: ${error}`);
    }
  }

  /**
   * Retrieve access token from SecureStore
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Get all tasks from TickTick
   */
  async getTasks(): Promise<Todo[]> {
    try {
      const response = await this.axiosInstance.get('/task');
      const tasks = response.data;

      if (!Array.isArray(tasks)) {
        throw new Error('Invalid response format from TickTick API');
      }

      return tasks.map((task) => this.convertTickTickToTodo(task));
    } catch (error) {
      throw new Error(`Failed to fetch tasks: ${error}`);
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<Todo> {
    try {
      const response = await this.axiosInstance.get(`/task/${id}`);
      return this.convertTickTickToTodo(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch task ${id}: ${error}`);
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
  async getProjects(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/project');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error}`);
    }
  }

  /**
   * Convert TickTick task format to our Todo type
   */
  convertTickTickToTodo(data: any): Todo {
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
