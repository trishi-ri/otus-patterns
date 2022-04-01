import { Command } from '../core/command.model';

export class RepeatCommand implements Command {
  private command: Command;

  constructor(command: Command) {
    this.command = command;
  }

  execute(): void {
    this.command.execute();
  }
}

export class RepeatTwiceCommand extends RepeatCommand {}
