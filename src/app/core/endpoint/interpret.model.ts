import { IoC } from 'src/app/app.config';
import { Command } from '../command.model';
import { UObject } from '../u-object.model';
import { IAgentMessage } from './agent-message.model';

export class InterpretCommand implements Command {
  constructor(private message: IAgentMessage) {}

  execute(): void {
    const { gameId, objectId, commandId, args } = this.message;

    const gameObject = IoC.resolve<UObject>('Game.GetObject', gameId, objectId);
    const parsedArgs: Record<string, unknown> = args ? JSON.parse(args) : {};
    const commandParameters = (parsedArgs['commandParameters'] as unknown[]) ?? [];
    const command = IoC.resolve<Command>(
      'Game.GetCommand',
      gameId,
      commandId,
      gameObject,
      ...commandParameters,
    );

    IoC.resolve<void>('Game.AddCommandToQueue', gameId, command);
  }
}
