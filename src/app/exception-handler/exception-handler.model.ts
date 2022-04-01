import { Command } from '../core/command.model';

export interface ExceptionHandler {
  handle(error: Error, command: Command): void;
}
