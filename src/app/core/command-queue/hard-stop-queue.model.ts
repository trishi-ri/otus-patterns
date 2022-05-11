import { Command } from '../command.model';
import { CommandQueue } from './command-queue.model';

export class HardStopQueue implements Command {
  constructor(private queue: CommandQueue) {}

  execute(): void {
    this.queue.hardStopQueue();
  }
}
