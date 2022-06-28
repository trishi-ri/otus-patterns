import { IoC } from 'src/app/app.config';
import { MathUtils } from 'src/app/utils/math.utils';
import { CommandQueue } from '../command-queue/command-queue.model';
import { Command } from '../command.model';
import { IoCUtils } from '../ioc/ioc.utils';
import { MoveCommand, Movable } from '../movements/move.model';
import { UObject } from '../u-object.model';
import { Vector } from '../vector.model';
import { IAgentMessage } from './agent-message.model';
import { GameRegisterCommand } from './game.ioc';
import { InterpretCommand } from './interpret.model';

GameRegisterCommand.execute();

describe('InterpretCommand', () => {
  it('выполнение InterpretCommand => создана указанная команда для указанного объекта и поставлена в очередь команд указанной игры', () => {
    const gameId = IoC.resolve<number>('Game.CreateGame');
    const objectId = IoC.resolve<number>('Game.AddObject', gameId, getUObject());
    const commandId = IoC.resolve<number>(
      'Game.AddCommand',
      gameId,
      'Game.GetCommand.Move',
      (object: UObject): Command => {
        return new MoveCommand(IoC.resolve<Movable>('Adapter', 'Movable', object));
      },
    );

    const message: IAgentMessage = { gameId, commandId, objectId };
    const command = new InterpretCommand(message);

    expect(IoC.resolve<CommandQueue>('Game.GetQueue', gameId).isEmpty).toBe(true);

    command.execute();

    const gameQueue = IoC.resolve<CommandQueue>('Game.GetQueue', gameId);
    expect(gameQueue.isEmpty).toBe(false);
    const stateSpy = jasmine.createSpy();
    gameQueue.statusLogger$.subscribe(stateSpy);

    IoC.resolve<void>('Game.StartQueue', gameId);
    IoC.resolve<void>('Game.ExecuteQueue', gameId);

    expect(stateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : MoveCommand'],
      ['waiting'],
    ]);

    const position = IoCUtils.tryInScope(`${gameId}`, () => {
      const object = IoC.resolve<UObject>('Game.GetObject', gameId, objectId);
      return object.getProperty('Position');
    });
    expect(position).toEqual(new Vector(1, 3));
  });

  function getUObject(): UObject {
    IoC.resolve<Command>('IoC.Register', 'uObject.Position', () => new Vector(0, 0)).execute();
    IoC.resolve<Command>('IoC.Register', 'uObject.Velocity', () => new Vector(1, 3)).execute();
    return {
      getProperty: <T>(key: string): T => {
        return IoC.resolve<T>(`uObject.${key}`);
      },
      setProperty: <T>(key: string, newValue: T): void => {
        IoC.resolve<Command>('IoC.Register', `uObject.${key}`, () => newValue).execute();
      },
    };
  }

  it('выполнение InterpretCommand (нет игры с указанным айди) => исключение', () => {
    const gameId = MathUtils.randomId;
    const objectId = MathUtils.randomId;
    const commandId = MathUtils.randomId;

    const message: IAgentMessage = { gameId, commandId, objectId };
    const command = new InterpretCommand(message);

    expect(() => command.execute()).toThrowError(
      `для получения объекта игры не найдена игра с айди "${gameId}"`,
    );
  });

  it('выполнение InterpretCommand (нет объекта в игре с указанным айди) => исключение', () => {
    const gameId = IoC.resolve<number>('Game.CreateGame');
    const objectId = MathUtils.randomId;
    const commandId = MathUtils.randomId;

    const message: IAgentMessage = { gameId, commandId, objectId };
    const command = new InterpretCommand(message);

    expect(() => command.execute()).toThrowError(
      `не найден объект с айди "${objectId}" для игры с айди "${gameId}"`,
    );
  });

  it('выполнение InterpretCommand (нет команды в игре с указанным айди) => исключение', () => {
    const gameId = IoC.resolve<number>('Game.CreateGame');
    const objectId = IoC.resolve<number>('Game.AddObject', gameId, getUObject());
    const commandId = MathUtils.randomId;

    const message: IAgentMessage = { gameId, commandId, objectId };
    const command = new InterpretCommand(message);

    expect(() => command.execute()).toThrowError(
      `не удалось получить команду по айди "${commandId}" для игры с айди "${gameId}"`,
    );
  });
});
