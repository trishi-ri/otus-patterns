import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { MathUtils } from 'src/app/utils/math.utils';
import { AuthorizationService } from '../authorization-microservice/authorization.service';
import { ClientGameService } from '../authorization-microservice/client-game.service';
import { CommandQueue } from '../command-queue/command-queue.model';
import { IAgentMessage } from './agent-message.model';
import { IoC } from './game.ioc';
import { InterpretCommand } from './interpret.model';
import { MessageEndpoint } from './message-endpoint.model';

describe('MessageEndpoint', () => {
  let gameId: number;
  let jwt$: Observable<string>;

  beforeEach(() => {
    const clientGame = new ClientGameService(new AuthorizationService());
    jwt$ = clientGame.init().pipe(
      switchMap(() => {
        gameId = clientGame.createGame();
        return clientGame.loginToGame(gameId);
      }),
    );
  });

  it('addCommandToGame (айди созданной игры) => добавление команды в очередь игры', (doneFn) => {
    jwt$
      .pipe(
        switchMap((jwt: string) => {
          const message: IAgentMessage = {
            gameId,
            commandId: 0,
            objectId: 0,
            args: JSON.stringify({ commandParameters: [25], token: jwt }),
          };

          expect(IoC.resolve<CommandQueue>('Game.GetQueue', gameId).nextCommands).toEqual([]);

          return MessageEndpoint.addCommandToGame(message).pipe(map(() => message));
        }),
      )
      .subscribe((message: IAgentMessage) => {
        expect(IoC.resolve<CommandQueue>('Game.GetQueue', gameId).nextCommands).toEqual([
          new InterpretCommand(message),
        ]);
        doneFn();
      });
  });

  it('addCommandToGame (если нет доступа к игре) => будет исключение', (doneFn) => {
    const otherGameId = MathUtils.randomId;

    jwt$
      .pipe(
        switchMap((jwt: string) => {
          const message: IAgentMessage = {
            gameId: otherGameId,
            commandId: 0,
            objectId: 0,
            args: JSON.stringify({ commandParameters: [25], token: jwt }),
          };

          return MessageEndpoint.addCommandToGame(message);
        }),
      )
      .pipe(
        catchError((errorMessage: Error) => {
          expect(errorMessage).toEqual(
            new Error(`у пользователя нет доступа к запрошеной игре: "${otherGameId}"`),
          );
          return of(undefined);
        }),
      )
      .subscribe(() => doneFn());
  });
});
