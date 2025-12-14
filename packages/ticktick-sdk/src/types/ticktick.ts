// TickTick API Types
// These match the actual TickTick API responses

export interface TickTickProject {
  id: string;
  name: string;
  color?: string;
  sortOrder?: number;
  closed?: boolean;
  groupId?: string;
  viewMode?: string;
  permission?: string;
  kind?: 'TASK' | 'NOTE' | string;
  teamId?: string;
  etag?: string;
}

export interface TickTickTask {
  id: string;
  projectId: string;
  title: string;
  content?: string;
  desc?: string;
  allDay?: boolean;
  isAllDay?: boolean;
  startDate?: string;
  dueDate?: string;
  timeZone?: string;
  reminders?: string[];
  repeat?: string;
  repeatFlag?: string;
  priority?: number;
  status?: number;
  completedTime?: string;
  createdTime?: string;
  modifiedTime?: string;
  sortOrder?: number;
  tags?: string[];
  items?: TickTickSubtask[];
}

export interface TickTickSubtask {
  id: string;
  title: string;
  status: number;
  completedTime?: string;
  startDate?: string;
  isAllDay?: boolean;
  sortOrder?: number;
  timeZone?: string;
}

export interface TickTickColumn {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
}

export interface TickTickProjectData {
  project: TickTickProject;
  tasks: TickTickTask[];
  columns?: TickTickColumn[];
}

export interface TickTickOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}
