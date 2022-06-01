import { IAgentMessage } from './agent-message.model';
import { IoC } from './game.ioc';
import { InterpretCommand } from './interpret.model';

export class MessageEndpoint {
  addCommandToGame(message: IAgentMessage): void {
    IoC.resolve<void>('Game.AddCommandToQueue', message.gameId, new InterpretCommand(message));
  }
}
