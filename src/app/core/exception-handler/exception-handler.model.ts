import { Command } from '../command.model';

export interface ExceptionHandler {
  handle(error: Error, command: Command): void;
}
