import { Subject } from 'rxjs';
import { Command } from '../command.model';
import { ExceptionHandler } from './exception-handler.model';
import { LogError } from './log-error.model';
import { RepeatCommand, RepeatTwiceCommand } from './repeat-command.model';

export class QueueExceptionHandler implements ExceptionHandler {
  constructor(private queue$: Subject<Command>) {}

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
      ['ErrorMoveCommand']: (e, _, q$) => q$.next(new LogError(e)),
      ['ErrorRotateCommand']: (_, c, q$) => q$.next(new RepeatCommand(c)),
      ['ErrorRepeatCommand']: (e, _, q$) => q$.next(new LogError(e)),
      ['RangeErrorRepeatCommand']: (_, c, q$) => q$.next(new RepeatTwiceCommand(c)),
      ['ErrorRepeatTwiceCommand']: (e, _, q$) => q$.next(new LogError(e)),
    };
  }
}
