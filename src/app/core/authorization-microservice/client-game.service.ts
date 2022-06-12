import { Observable, tap } from 'rxjs';
import { IAgentMessage } from '../endpoint/agent-message.model';
import { MessageEndpoint } from '../endpoint/message-endpoint.model';
import { AuthorizationService } from './authorization.service';

export class ClientGameService {
  private user: string = 'current user';
  private jwdToken?: string;

  constructor(
    private authService: AuthorizationService,
    private messageEndpoint: MessageEndpoint,
  ) {}

  init(): Observable<void> {
    return this.authService.init();
  }

  createGame(users: string[] = [this.user]): number {
    return this.authService.createGame(users);
  }

  loginToGame(gameId: number): Observable<string> {
    return this.authService
      .getUserToken(this.user, gameId)
      .pipe(tap((token) => (this.jwdToken = token)));
  }

  sendCommandToGame(message: IAgentMessage): Observable<void> {
    if (!this.jwdToken) {
      throw new Error('пользователь не залогинен, нет токена');
    }
    const { args } = message;
    const parsedArgs: Record<string, unknown> = args ? JSON.parse(args) : {};
    parsedArgs['token'] = this.jwdToken;
    message.args = JSON.stringify(parsedArgs);

    return this.messageEndpoint.addCommandToGameWithJWT(message);
  }
}
