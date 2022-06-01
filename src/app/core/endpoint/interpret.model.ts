import { Command } from '../command.model';
import { IoCUtils } from '../ioc/ioc.utils';
import { UObject } from '../u-object.model';
import { IAgentMessage } from './agent-message.model';
import { IoC } from './game.ioc';

export class InterpretCommand implements Command {
  constructor(private message: IAgentMessage) {}

  execute(): void {
    const { gameId, objectId, commandId, args } = this.message;

    const gameObject = IoC.resolve<UObject>('Game.GetObject', gameId, objectId);
    const parsedArgs: unknown[] = args ? JSON.parse(args) : [];
    const command = IoC.resolve<Command>(
      'Game.GetCommand',
      gameId,
      commandId,
      gameObject,
      ...parsedArgs,
    );

    IoC.resolve<void>('Game.AddCommandToQueue', gameId, command);
  }
}
