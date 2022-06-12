import { catchError, from, map, Observable } from 'rxjs';
import * as jose from 'jose';
import { IAgentMessage } from './agent-message.model';
import { IoC } from './game.ioc';
import { InterpretCommand } from './interpret.model';

export class MessageEndpoint {
  addCommandToGame(message: IAgentMessage): void {
    IoC.resolve<void>('Game.AddCommandToQueue', message.gameId, new InterpretCommand(message));
  }

  addCommandToGameWithJWT(message: IAgentMessage): Observable<void> {
    const { gameId, args } = message;
    const parsedArgs: Record<string, unknown> = args ? JSON.parse(args) : {};
    const jwt = parsedArgs['token'] as string;
    if (!jwt) {
      throw new Error(`сообщение не содержит токен: ${JSON.stringify(message)}`);
    }

    const publicKey = IoC.resolve<CryptoKey>('AuthPublicKey');
    return from(jose.jwtVerify(jwt, publicKey)).pipe(
      map(({ payload }) => {
        if (payload['gameId'] === gameId) {
          IoC.resolve<void>('Game.AddCommandToQueue', gameId, new InterpretCommand(message));
        } else {
          throw new Error(`у пользователя нет доступа к запрошеной игре: "${gameId}"`);
        }
      }),
    );
  }
}
