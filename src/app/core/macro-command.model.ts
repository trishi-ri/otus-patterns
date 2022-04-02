import { Command } from './command.model';

export class MacroCommand implements Command {
  private commands: Command[];

  constructor(commands: Command[]) {
    this.commands = commands;
  }

  public execute(): void {
    try {
      this.commands.forEach((command: Command) => command.execute());
    } catch (e) {
      throw e;
    }
  }
}
