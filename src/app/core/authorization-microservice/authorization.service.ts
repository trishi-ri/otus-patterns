import { IoC } from 'src/app/app.config';
import * as jose from 'jose';
import { from, map, Observable } from 'rxjs';
import { Command } from '../command.model';

export class AuthorizationService {
  private privateKey!: CryptoKey;

  init(): Observable<void> {
    return from(
      window.crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true,
        ['sign', 'verify'],
      ),
    ).pipe(
      map((pair) => {
        this.privateKey = pair.privateKey as CryptoKey;
        IoC.resolve<Command>('IoC.Register', 'AuthPublicKey', () => pair.publicKey).execute();
      }),
    );
  }

  createGame(users: string[]): number {
    return IoC.resolve<number>('Game.CreateGame', users);
  }

  getUserToken(user: string, gameId: number): Observable<string> {
    const users = IoC.resolve<string[]>('Game.GetUsers', gameId);
    const payload = users.includes(user) ? { gameId } : {};
    return from(
      new jose.SignJWT(payload).setProtectedHeader({ alg: 'ES256' }).sign(this.privateKey),
    );
  }
}
