import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { MathUtils } from 'src/app/utils/math.utils';
import { CommandQueue } from '../command-queue/command-queue.model';
import { IAgentMessage } from '../endpoint/agent-message.model';
import { IoC } from '../endpoint/game.ioc';
import { InterpretCommand } from '../endpoint/interpret.model';
import { MessageEndpoint } from '../endpoint/message-endpoint.model';
import { AuthorizationService } from './authorization.service';
import { ClientGameService } from './client-game.service';

describe('ClientGameService', () => {
  let service: ClientGameService;

  beforeEach(
    () => (service = new ClientGameService(new AuthorizationService(), new MessageEndpoint())),
  );

  it('loginToGame', (doneFn) => {
    service
      .init()
      .pipe(
        switchMap(() => {
          expect(IoC.resolve<CryptoKey>('AuthPublicKey')).toBeTruthy();

          const gameId = service.createGame();
          return service.loginToGame(gameId);
        }),
      )
      .subscribe((jwt) => {
        expect(jwt).toBeTruthy();

        doneFn();
      });
  });

  describe('sendCommandToGame', () => {
    let gameId: number;
    let jwt$: Observable<string>;

    beforeEach(() => {
      jwt$ = service.init().pipe(
        switchMap(() => {
          gameId = service.createGame();
          return service.loginToGame(gameId);
        }),
      );
    });

    it('sendCommandToGame (айди созданной игры) => добавление команды в очередь игры', (doneFn) => {
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

            return service.sendCommandToGame(message).pipe(map(() => message));
          }),
        )
        .subscribe((message: IAgentMessage) => {
          expect(IoC.resolve<CommandQueue>('Game.GetQueue', gameId).nextCommands).toEqual([
            new InterpretCommand(message),
          ]);
          doneFn();
        });
    });

    it('sendCommandToGame (если нет доступа к игре) => будет исключение', (doneFn) => {
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

            return service.sendCommandToGame(message);
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
});
