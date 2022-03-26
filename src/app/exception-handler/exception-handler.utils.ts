import { Command } from '../core/command.model';

export class HandlerCommandsUtils {
  public static getKeyForStrategy(error: Error, command: Command): string {
    return error.constructor.name + command.constructor.name;
  }
}
