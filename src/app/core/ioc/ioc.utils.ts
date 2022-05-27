import { IoC } from 'src/app/app.config';
import { Command } from '../command.model';

export class IoCUtils {
  public static tryInScope<T>(scopeName: string, fn: () => T): T | Error | void {
    const previousScope = IoC.scopeName;
    try {
      if (!IoC.scoupesNames.includes(scopeName)) {
        IoC.resolve<Command>('Scope.New', scopeName).execute();
      }
      IoC.resolve<Command>('Scope.Current', scopeName).execute();
      return fn();
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
    } finally {
      IoC.resolve<Command>('Scope.Current', previousScope).execute();
    }
  }
}
