import { Command } from '../command.model';
import { NormalQueueMode } from './command-queue-mode.model';
import { CommandQueueWithMode } from './command-queue-with-mode.model';

export class Run implements Command {
  constructor(private queue: CommandQueueWithMode) {}

  execute(): void {
    this.queue.currentMode = new NormalQueueMode();
  }
}
