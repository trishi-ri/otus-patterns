import { Command } from '../command.model';

export class RepeatCommand implements Command {
  constructor(private command: Command) {}

  execute(): void {
    this.command.execute();
  }
}

export class RepeatTwiceCommand extends RepeatCommand {}
