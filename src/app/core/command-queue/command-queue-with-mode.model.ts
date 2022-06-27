import { CommandQueueMode, NormalQueueMode } from './command-queue-mode.model';
import { CommandQueue, QueueState } from './command-queue.model';

export class CommandQueueWithMode extends CommandQueue {
  currentMode: CommandQueueMode = new NormalQueueMode();

  constructor() {
    super();
  }

  override executeCommands(): void {
    while (!this.isEmpty && this.currentMode) {
      this.currentMode = this.currentMode.handle(this);
    }
    if (this.stoppingCommand) {
      this.setState(QueueState.stopped);
    }
  }
}
