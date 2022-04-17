import { Command } from './command.model';

export class MacroCommand implements Command {
  constructor(private commands: Command[]) {}

  public execute(): void {
    try {
      this.commands.forEach((command: Command) => command.execute());
    } catch (e) {
      throw e;
    }
  }
}
