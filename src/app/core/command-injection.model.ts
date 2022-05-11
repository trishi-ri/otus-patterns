import { Command } from './command.model';

export interface CommandInjection {
  inject(inner: Command): void;
}

export class BridgeCommand implements Command, CommandInjection {
  constructor(public inner: Command) {}

  public inject(inner: Command) {
    this.inner = inner;
  }

  public execute(): void {
    this.inner.execute();
  }
}
