export interface Command {
  execute(): void;
}

export class NotCommand implements Command {
  execute(): void {}
}
