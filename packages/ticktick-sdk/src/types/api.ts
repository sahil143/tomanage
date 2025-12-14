/**
 * Strict types for TickTick API requests and responses
 */

// ============================================================================
// OAuth API Types
// ============================================================================

export interface OAuthTokenRequest {
  client_id: string;
  code: string;
  grant_type: 'authorization_code';
  scope: string;
  redirect_uri: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export interface OAuthErrorResponse {
  error: string;
  error_description?: string;
}

// ============================================================================
// Task API Types
// ============================================================================

export interface CreateTaskRequest {
  title: string;
  content?: string;
  desc?: string;
  allDay?: boolean;
  startDate?: string;
  dueDate?: string;
  timeZone?: string;
  reminders?: string[];
  repeat?: string;
  priority?: 0 | 1 | 3 | 5;
  sortOrder?: number;
  items?: CreateSubtaskRequest[];
  projectId?: string;
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: 0 | 2; // 0 = active, 2 = completed
  completedTime?: string;
}

export interface CreateSubtaskRequest {
  title: string;
  status?: 0 | 2;
  startDate?: string;
  allDay?: boolean;
  sortOrder?: number;
  timeZone?: string;
}

export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  content?: string;
  desc?: string;
  allDay?: boolean;
  startDate?: string;
  dueDate?: string;
  timeZone?: string;
  reminders?: string[];
  repeat?: string;
  priority?: number;
  status?: number;
  completedTime?: string;
  createdTime?: string;
  modifiedTime?: string;
  sortOrder?: number;
  items?: SubtaskResponse[];
  tags?: string[];
  isAllDay?: boolean;
  repeatFlag?: string;
}

export interface SubtaskResponse {
  id: string;
  title: string;
  status: number;
  completedTime?: string;
  startDate?: string;
  isAllDay?: boolean;
  sortOrder?: number;
  timeZone?: string;
}

// ============================================================================
// Project API Types
// ============================================================================

export interface CreateProjectRequest {
  name: string;
  color?: string;
  sortOrder?: number;
  kind?: 'TASK' | 'NOTE';
  viewMode?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  color?: string;
  sortOrder?: number;
  closed?: boolean;
  viewMode?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  color?: string;
  sortOrder?: number;
  closed?: boolean;
  groupId?: string;
  viewMode?: string;
  permission?: string;
  kind?: 'TASK' | 'NOTE';
  teamId?: string;
  etag?: string;
}

export interface ProjectDataResponse {
  project: ProjectResponse;
  tasks: TaskResponse[];
  columns?: ColumnResponse[];
}

export interface ColumnResponse {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
}

// ============================================================================
// Error Response Types
// ============================================================================

export interface ApiErrorResponse {
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  error?: string;
  error_description?: string;
}

// ============================================================================
// HTTP Client Types
// ============================================================================

export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
