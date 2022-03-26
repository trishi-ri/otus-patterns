import { Subject } from 'rxjs';
import { Command } from '../core/command.model';
import { LogError } from './log-error.model';
import { RepeatCommand, RepeatTwiceCommand } from './repeat-command.model';

export const STRATEGIES: Record<
  string,
  (error: Error, command: Command, queue$: Subject<Command>) => void
> = {
  ['queueNextLog']: (error, _, queue$) => queue$.next(new LogError(error)),

  ['queueNextRepeat']: (_, command, queue$) => queue$.next(new RepeatCommand(command)),

  ['queueNextRepeatAndLog']: (error, command, queue$) => {
    if (command instanceof RepeatCommand) {
      queue$.next(new LogError(error));
    } else {
      queue$.next(new RepeatCommand(command));
    }
  },

  ['queueNextRepeatTwiceAndLog']: (error, command, queue$) => {
    if (command instanceof RepeatTwiceCommand) {
      queue$.next(new LogError(error));
    } else if (command instanceof RepeatCommand) {
      queue$.next(new RepeatTwiceCommand(command));
    } else {
      queue$.next(new RepeatCommand(command));
    }
  },
};
