import { TickTickConfig } from './types/config';
import { AuthService } from './auth/AuthService';
import { TasksService } from './tasks/TasksService';
import { ProjectsService } from './projects/ProjectsService';
import { HttpClient } from './utils/httpClient';
import { TICKTICK_API } from './utils/constants';

/**
 * Main TickTick SDK service with chainable API
 *
 * @example
 * ```typescript
 * const ticktick = new TickTickService({
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 *   storage: storageAdapter,
 * });
 *
 * // Auth
 * await ticktick.auth.exchangeCodeForToken(code, redirectUri);
 * const isAuthed = await ticktick.auth.isAuthenticated();
 *
 * // Tasks (returns raw TickTick API format)
 * const tasks = await ticktick.tasks.getAll();
 * await ticktick.tasks.create({ title: 'New task', projectId: 'inbox123' });
 *
 * // Projects
 * const projects = await ticktick.projects.getAll();
 * ```
 */
export class TickTickService {
  private httpClient: HttpClient;

  // Chainable service properties
  public readonly auth: AuthService;
  public readonly tasks: TasksService;
  public readonly projects: ProjectsService;

  constructor(config: TickTickConfig) {
    const {
      clientId,
      clientSecret,
      storage,
      baseUrl = TICKTICK_API.BASE_URL,
      oauthUrl = TICKTICK_API.OAUTH_URL,
      timeout = TICKTICK_API.DEFAULT_TIMEOUT,
    } = config;

    // Create HTTP client with token getter
    this.httpClient = new HttpClient(
      baseUrl,
      timeout,
      () => storage.getItem('ticktick-access-token')
    );

    // Initialize services
    this.auth = new AuthService(storage, clientId, clientSecret, oauthUrl, timeout);
    this.projects = new ProjectsService(this.httpClient);
    this.tasks = new TasksService(this.httpClient, this.projects);
  }
}

export default TickTickService;
