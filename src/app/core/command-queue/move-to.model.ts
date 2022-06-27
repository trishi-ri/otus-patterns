import { IoC } from 'src/app/app.config';
import { Command } from '../command.model';
import { MoveToQueueMode } from './command-queue-mode.model';
import { CommandQueueWithMode } from './command-queue-with-mode.model';
import { CommandQueue } from './command-queue.model';

export class MoveTo implements Command {
  constructor(private queue: CommandQueueWithMode, private taretQueue: CommandQueue) {}

  execute(): void {
    IoC.resolve<Command>(
      'IoC.Register',
      'CommandQueueWithMode.TargetQueue',
      () => this.taretQueue,
    ).execute();
    this.queue.currentMode = new MoveToQueueMode();
  }
}
