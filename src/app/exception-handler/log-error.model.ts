import { Command } from '../core/command.model';

export class LogError implements Command {
  private error: Error;

  constructor(error: Error) {
    this.error = error;
  }

  execute(): void {
    console.log(this.error);
  }
}
