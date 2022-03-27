import { Subject } from 'rxjs';
import { Command } from '../core/command.model';
import { ExceptionHandler } from './exception-handler.model';
import { LogError } from './log-error.model';
import { RepeatCommand, RepeatTwiceCommand } from './repeat-command.model';

export class QueueExceptionHandler implements ExceptionHandler {
  private queue$: Subject<Command>;

  constructor(queue$: Subject<Command>) {
    this.queue$ = queue$;
  }

  public handle(error: Error, command: Command): void {
    const key = this.getKeyForStrategy(error, command);
    this.strategis[key](error, command, this.queue$);
  }

  private getKeyForStrategy(error: Error, command: Command): string {
    return error.constructor.name + command.constructor.name;
  }

  private get strategis(): Record<
    string,
    (error: Error, command: Command, queue$: Subject<Command>) => void
  > {
    return {
      ['ErrorMove']: (e, _, q$) => q$.next(new LogError(e)),
      ['ErrorRotate']: (_, c, q$) => q$.next(new RepeatCommand(c)),
      ['ErrorRepeatCommand']: (e, _, q$) => q$.next(new LogError(e)),
      ['RangeErrorRepeatCommand']: (_, c, q$) => q$.next(new RepeatTwiceCommand(c)),
      ['ErrorRepeatTwiceCommand']: (e, _, q$) => q$.next(new LogError(e)),
    };
  }
}
