import { IoC } from 'src/app/app.config';
import { CommandQueueWithMode } from './command-queue-with-mode.model';
import { CommandQueue } from './command-queue.model';

export interface CommandQueueMode {
  handle(queue: CommandQueueWithMode): CommandQueueMode;
}

export class NormalQueueMode implements CommandQueueMode {
  handle(queue: CommandQueueWithMode): CommandQueueMode {
    const nextCommand = queue.getNextCommand();
    if (!nextCommand) {
      return this.defaultMode;
    }

    queue.executeCommand(nextCommand);

    return modeByCommand[nextCommand.constructor.name] ?? this.defaultMode;
  }

  private get defaultMode(): CommandQueueMode {
    return new NormalQueueMode();
  }
}

export class MoveToQueueMode implements CommandQueueMode {
  handle(queue: CommandQueueWithMode): CommandQueueMode {
    const nextCommand = queue.getNextCommand();
    if (!nextCommand) {
      return this.defaultMode;
    }

    const targetQueue = IoC.resolve<CommandQueue>('CommandQueueWithMode.TargetQueue');
    if (!targetQueue) {
      throw new Error('Не установлена целевая очередь для перенаправления команд!');
    }
    targetQueue.addCommand(nextCommand);

    return modeByCommand[nextCommand.constructor.name] ?? this.defaultMode;
  }

  private get defaultMode(): CommandQueueMode {
    return new MoveToQueueMode();
  }
}

const emptyMode = { handle: (_: CommandQueueWithMode) => {} } as CommandQueueMode;
const modeByCommand: Record<string, CommandQueueMode> = {
  HardStopQueue: emptyMode,
  Run: new NormalQueueMode(),
  MoveTo: new MoveToQueueMode(),
};
