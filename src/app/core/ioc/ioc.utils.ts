import { IoC } from 'src/app/app.config';
import { Command } from '../command.model';

export class IoCUtils {
  public static tryInScope(scopeName: string, fn: Function): Error[] {
    const previousScope = IoC.scopeName;
    const catchedErrors = [];
    try {
      if (!IoC.scoupesNames.includes(scopeName)) {
        IoC.resolve<Command>('Scope.New', scopeName).execute();
      }
      IoC.resolve<Command>('Scope.Current', scopeName).execute();
      fn();
    } catch (e) {
      if (e instanceof Error) {
        catchedErrors.push(e);
      }
    } finally {
      IoC.resolve<Command>('Scope.Current', previousScope).execute();
    }
    return catchedErrors;
  }
}
