import { switchMap } from 'rxjs';
import { IoC } from '../endpoint/game.ioc';
import { AuthorizationService } from './authorization.service';
import { ClientGameService } from './client-game.service';

describe('ClientGameService', () => {
  it('loginToGame', (doneFn) => {
    const clientGame = new ClientGameService(new AuthorizationService());
    clientGame
      .init()
      .pipe(
        switchMap(() => {
          expect(IoC.resolve<CryptoKey>('AuthPublicKey')).toBeTruthy();

          const gameId = clientGame.createGame();
          return clientGame.loginToGame(gameId);
        }),
      )
      .subscribe((jwt) => {
        expect(jwt).toBeTruthy();

        doneFn();
      });
  });
});
