import { IoC } from 'src/app/app.config';
import { CommandQueue } from '../command-queue/command-queue.model';
import { Command } from '../command.model';
import { IoCUtils } from '../ioc/ioc.utils';
import { MacroCommand } from '../macro-command.model';
import { MoveCommand, Movable } from '../movements/move.model';
import { UObject } from '../u-object.model';
import { Vector } from '../vector.model';
import { GameRegisterCommand } from './game.ioc';
import {
  GameOrderCommand,
  GameActionCommand,
  TargetGameObjectCommand,
  TargetGameCommand,
} from './order-interpret.model';

GameRegisterCommand.execute();

describe('OrderInterpret', () => {
  let gameId: number;
  const myUser = 'my user';
  const otherUser = 'other user';

  beforeEach(() => {
    gameId = IoC.resolve<number>('Game.CreateGame', [myUser, otherUser]);
    IoC.resolve<number>(
      'Game.AddCommand',
      gameId,
      'Game.GetCommand.Move',
      (object: UObject): Command => {
        return new MoveCommand(IoC.resolve<Movable>('Adapter', 'Movable', object));
      },
    );
  });

  it('обработка приказа для своего объекта возможна', () => {
    const myObjectId = IoC.resolve<number>(
      'Game.AddObject',
      gameId,
      getMovableObject('my object', { position: new Vector(0, 0), velocity: new Vector(1, 3) }),
      myUser,
    );
    const orderObject = getOrderObject('order for move my object', {
      id: myObjectId,
      action: 'Move',
    });

    const iterpretOrderCommand = new TargetGameCommand(
      gameId,
      new TargetGameObjectCommand(myUser, new GameActionCommand(new GameOrderCommand())),
    );
    iterpretOrderCommand.interpret(orderObject).execute();

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

    const position = IoCUtils.tryInScope(`${gameId}.${myUser}`, () => {
      const object = IoC.resolve<UObject>('Game.GetObject', gameId, myObjectId, myUser);
      return object.getProperty('Position');
    });
    expect(position).toEqual(new Vector(1, 3));
  });

  it('обработка приказа для чужого объекта невозможна', () => {
    const otherObjectId = IoC.resolve<number>(
      'Game.AddObject',
      gameId,
      getMovableObject('other object', { position: new Vector(0, 0), velocity: new Vector(1, 3) }),
      otherUser,
    );
    const orderObject = getOrderObject('order for move other object', {
      id: otherObjectId,
      action: 'Move',
    });

    const iterpretOrderCommand = new TargetGameCommand(
      gameId,
      new TargetGameObjectCommand(myUser, new GameActionCommand(new GameOrderCommand())),
    );
    expect(() => iterpretOrderCommand.interpret(orderObject).execute()).toThrowError(
      `не найден объект с айди "${otherObjectId}" для игры с айди "${gameId}"`,
    );

    const gameQueue = IoC.resolve<CommandQueue>('Game.GetQueue', gameId);
    expect(gameQueue.isEmpty).toBe(true);

    const position = IoCUtils.tryInScope(`${gameId}.${otherUser}`, () => {
      const object = IoC.resolve<UObject>('Game.GetObject', gameId, otherObjectId, otherUser);
      return object.getProperty('Position');
    });
    expect(position).toEqual(new Vector(0, 0));
  });

  function getOrderObject(
    orderKey: string,
    values: { id: number; action: string; actionParameters?: unknown[] },
  ): UObject {
    return getUObject(
      orderKey,
      new MacroCommand([
        IoC.resolve<Command>('IoC.Register', `OrderInterpret.${orderKey}.Id`, () => values.id),
        IoC.resolve<Command>(
          'IoC.Register',
          `OrderInterpret.${orderKey}.Action`,
          () => values.action,
        ),
        IoC.resolve<Command>(
          'IoC.Register',
          `OrderInterpret.${orderKey}.ActionParameters`,
          () => values.actionParameters,
        ),
      ]),
    );
  }

  function getMovableObject(
    objectKey: string,
    initialValues: { position: Vector; velocity: Vector },
  ): UObject {
    return getUObject(
      objectKey,
      new MacroCommand([
        IoC.resolve<Command>(
          'IoC.Register',
          `OrderInterpret.${objectKey}.Position`,
          () => initialValues.position,
        ),
        IoC.resolve<Command>(
          'IoC.Register',
          `OrderInterpret.${objectKey}.Velocity`,
          () => initialValues.velocity,
        ),
      ]),
    );
  }

  function getUObject(objectKey: string, registerMacro: MacroCommand): UObject {
    registerMacro.execute();
    return {
      getProperty: <T>(key: string): T => {
        return IoC.resolve<T>(`OrderInterpret.${objectKey}.${key}`);
      },
      setProperty: <T>(key: string, newValue: T): void => {
        IoC.resolve<Command>(
          'IoC.Register',
          `OrderInterpret.${objectKey}.${key}`,
          () => newValue,
        ).execute();
      },
    };
  }
});
