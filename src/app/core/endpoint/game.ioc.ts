import { MathUtils } from 'src/app/utils/math.utils';
import { CommandQueue } from '../command-queue/command-queue.model';
import { Command } from '../command.model';
import { IoCContainer } from '../ioc/ioc-container.model';
import { IoCUtils } from '../ioc/ioc.utils';
import { UObject } from '../u-object.model';

export const IoC = new IoCContainer();

IoC.resolve<Command>('IoC.Register', 'Game.CreateGame', (): number => {
  const gameId = MathUtils.randomId;
  const scopeName = `${gameId}`;
  IoC.resolve<Command>('Scope.New', scopeName).execute();
  IoCUtils.tryInScope(scopeName, () => {
    IoC.resolve<Command>(
      'IoC.Register',
      'Game.GetQueue',
      (): CommandQueue => new CommandQueue(),
    ).execute();

    IoC.resolve<Command>('IoC.Register', 'Game.GetObjects', (): GameObjects => ({})).execute();
  });
  return gameId;
}).execute();

IoC.resolve<Command>('IoC.Register', 'Game.GetQueue', (gameId: number): CommandQueue => {
  if (!gameId) {
    throw new Error('для получения очереди команд игры необходимо указать айди игры');
  }
  if (!IoC.scoupesNames.includes(`${gameId}`)) {
    throw new Error(`для получения очереди команд игры не найдена игра с айди "${gameId}"`);
  }
  const result = IoCUtils.tryInScope(`${gameId}`, () => IoC.resolve<CommandQueue>('Game.GetQueue'));
  if (result instanceof Error) {
    throw result;
  } else {
    if (!result) {
      throw new Error(`не удалось получить очередь команд для игры с айди "${gameId}"`);
    }
    return result;
  }
}).execute();

IoC.resolve<Command>('IoC.Register', 'Game.StartQueue', (gameId: number): void => {
  if (!gameId) {
    throw new Error('для запуска очереди команд игры необходимо указать айди игры');
  }
  if (!IoC.scoupesNames.includes(`${gameId}`)) {
    throw new Error(`для запуска очереди команд игры не найдена игра с айди "${gameId}"`);
  }
  const result = IoCUtils.tryInScope(`${gameId}`, () =>
    IoC.resolve<CommandQueue>('Game.GetQueue').start(),
  );
  if (result instanceof Error) {
    throw result;
  }
}).execute();

IoC.resolve<Command>('IoC.Register', 'Game.ExecuteQueue', (gameId: number): void => {
  if (!gameId) {
    throw new Error('для выполнения очереди команд игры необходимо указать айди игры');
  }
  if (!IoC.scoupesNames.includes(`${gameId}`)) {
    throw new Error(`для выполнения очереди команд игры не найдена игра с айди "${gameId}"`);
  }
  const result = IoCUtils.tryInScope(`${gameId}`, () =>
    IoC.resolve<CommandQueue>('Game.GetQueue').executeCommands(),
  );
  if (result instanceof Error) {
    throw result;
  }
}).execute();

IoC.resolve<Command>('IoC.Register', 'Game.GetObjects', (gameId: number): GameObjects => {
  if (!gameId) {
    throw new Error('для получения объектов игры необходимо указать айди игры');
  }
  if (!IoC.scoupesNames.includes(`${gameId}`)) {
    throw new Error(`для получения объектов игры не найдена игра с айди "${gameId}"`);
  }
  const result = IoCUtils.tryInScope(`${gameId}`, () =>
    IoC.resolve<GameObjects>('Game.GetObjects'),
  );
  if (result instanceof Error) {
    throw result;
  } else {
    if (!result) {
      throw new Error(`не удалось получить объекты для игры с айди "${gameId}"`);
    }
    return result;
  }
}).execute();

IoC.resolve<Command>(
  'IoC.Register',
  'Game.AddCommandToQueue',
  (gameId: number, command: Command): void => {
    if (!gameId) {
      throw new Error('для добавления команды в очередь игры необходимо указать айди игры');
    }
    if (!IoC.scoupesNames.includes(`${gameId}`)) {
      throw new Error(`для добавления команды в очередь игры не найдена игра с айди "${gameId}"`);
    }
    const result = IoCUtils.tryInScope(`${gameId}`, () => {
      const queue = IoC.resolve<CommandQueue>('Game.GetQueue');
      queue.addCommand(command);
      IoC.resolve<Command>('IoC.Register', 'Game.GetQueue', (): CommandQueue => queue).execute();
    });
    if (result instanceof Error) {
      throw result;
    }
  },
).execute();

type GameObjects = Record<number, UObject>;

IoC.resolve<Command>(
  'IoC.Register',
  'Game.GetObject',
  (gameId: number, objectId: number): UObject => {
    if (!gameId) {
      throw new Error('для получения объекта игры необходимо указать айди игры');
    }
    if (!IoC.scoupesNames.includes(`${gameId}`)) {
      throw new Error(`для получения объекта игры не найдена игра с айди "${gameId}"`);
    }
    const result = IoCUtils.tryInScope(`${gameId}`, () => {
      const objects = IoC.resolve<GameObjects>('Game.GetObjects');
      return objects[objectId];
    });
    if (result instanceof Error) {
      throw result;
    } else {
      if (!result) {
        throw new Error(`не найден объект с айди "${objectId}" для игры с айди "${gameId}"`);
      }
      return result;
    }
  },
).execute();

IoC.resolve<Command>(
  'IoC.Register',
  'Game.AddObject',
  (gameId: number, object: UObject): number => {
    if (!gameId) {
      throw new Error('для добавления объекта в игру необходимо указать айди игры');
    }
    if (!IoC.scoupesNames.includes(`${gameId}`)) {
      throw new Error(`для добавления объекта в игру не найдена игра с айди "${gameId}"`);
    }
    const result = IoCUtils.tryInScope(`${gameId}`, () => {
      const objectId = MathUtils.randomId;
      object.setProperty('id', objectId);
      const objects = IoC.resolve<GameObjects>('Game.GetObjects');
      objects[objectId] = object;
      IoC.resolve<Command>('IoC.Register', 'Game.GetObjects', (): GameObjects => objects).execute();
      return objectId;
    });
    if (result instanceof Error) {
      throw result;
    } else {
      if (!result) {
        throw new Error(`не удалось добавить объект в игру "${gameId}"`);
      }
      return result;
    }
  },
).execute();

type GameCommandKeys = Record<number, string>;

IoC.resolve<Command>('IoC.Register', 'Game.GetCommandKeys', (): GameCommandKeys => ({})).execute();

IoC.resolve<Command>(
  'IoC.Register',
  'Game.GetCommand',
  (gameId: number, commandId: number, ...args: unknown[]): Command => {
    if (!gameId) {
      throw new Error('для получения команды для игры необходимо указать айди игры');
    }
    if (!IoC.scoupesNames.includes(`${gameId}`)) {
      throw new Error(`для получения команды для игры не найдена игра с айди "${gameId}"`);
    }
    const result = IoCUtils.tryInScope(`${gameId}`, () => {
      const commandKey = IoC.resolve<GameCommandKeys>('Game.GetCommandKeys')[commandId];
      return commandKey ? IoC.resolve<Command>(commandKey, ...args) : undefined;
    });
    if (result instanceof Error) {
      throw result;
    } else {
      if (!result) {
        throw new Error(
          `не удалось получить команду по айди "${commandId}" для игры с айди "${gameId}"`,
        );
      }
      return result;
    }
  },
).execute();

IoC.resolve<Command>(
  'IoC.Register',
  'Game.AddCommand',
  (gameId: number, commandKey: string, commandFn: (...args: unknown[]) => Command): number => {
    if (!gameId) {
      throw new Error('для добавления команды для игры необходимо указать айди игры');
    }
    if (!IoC.scoupesNames.includes(`${gameId}`)) {
      throw new Error(`для добавления команды для игры не найдена игра с айди "${gameId}"`);
    }
    const result = IoCUtils.tryInScope(`${gameId}`, () => {
      const commandId = MathUtils.randomId;
      IoC.resolve<Command>('IoC.Register', commandKey, commandFn).execute();
      const commands = IoC.resolve<GameCommandKeys>('Game.GetCommandKeys');
      commands[commandId] = commandKey;
      IoC.resolve<Command>(
        'IoC.Register',
        'Game.GetCommandKeys',
        (): GameCommandKeys => commands,
      ).execute();
      return commandId;
    });
    if (result instanceof Error) {
      throw result;
    } else {
      if (!result) {
        throw new Error(`не удалось добавить команду в игру "${gameId}"`);
      }
      return result;
    }
  },
).execute();
