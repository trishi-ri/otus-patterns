import { Command } from '../command.model';

export class LogError implements Command {
  constructor(private error: Error) {}

  execute(): void {
    console.log(this.error);
  }
}
