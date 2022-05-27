import { MathUtils } from 'src/app/utils/math.utils';
import { CommandQueue } from '../command-queue/command-queue.model';
import { IAgentMessage } from './agent-message.model';
import { IoC } from './game.ioc';
import { InterpretCommand } from './interpret.model';
import { MessageEndpoint } from './message-endpoint.model';

describe('MessageEndpoint', () => {
  let service: MessageEndpoint;

  beforeEach(() => (service = new MessageEndpoint()));

  it('addCommandToGame (если игра уже была создана) => добавление команды в очередь игры', () => {
    const gameId = IoC.resolve<number>('Game.CreateGame');

    const message: IAgentMessage = { gameId, commandId: 0, objectId: 0, args: '25' };

    expect(IoC.resolve<CommandQueue>('Game.GetQueue', gameId).nextCommands).toEqual([]);

    service.addCommandToGame(message);

    expect(IoC.resolve<CommandQueue>('Game.GetQueue', gameId).nextCommands).toEqual([
      new InterpretCommand(message),
    ]);
  });

  it('addCommandToGame (если игры ещё не было) => будет исключение', () => {
    const gameId = MathUtils.randomId;

    const message: IAgentMessage = { gameId, commandId: 0, objectId: 0, args: '25' };

    expect(() => service.addCommandToGame(message)).toThrowError(
      `для добавления команды в очередь игры не найдена игра с айди "${gameId}"`,
    );
  });
});
