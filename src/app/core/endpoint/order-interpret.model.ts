import { IoC } from 'src/app/app.config';
import { Command } from '../command.model';
import { UObject } from '../u-object.model';
import { Order } from './order.model';

export interface OrderInterpret {
  interpret(orderObject: UObject): Command;
}

export class GameOrderCommand implements OrderInterpret {
  constructor() {}

  interpret(_: UObject): Command {
    const command = IoC.resolve<Command>('targetGameCommand');
    const gameId = IoC.resolve<number>('targetGameId');
    return { execute: () => IoC.resolve<void>('Game.AddCommandToQueue', gameId, command) };
  }
}

export class GameActionCommand implements OrderInterpret {
  constructor(private gameOrder: OrderInterpret) {}

  interpret(orderObject: UObject): Command {
    const order = IoC.resolve<Order>('Adapter', 'Order', orderObject);
    const gameId = IoC.resolve<number>('targetGameId');
    const command = IoC.resolve<Command>(
      'Game.GetCommandByKey',
      gameId,
      order.getAction(),
      IoC.resolve<UObject>('targetGameObject'),
      ...(order.getActionParameters() ?? []),
    );
    IoC.resolve<Command>('IoC.Register', 'targetGameCommand', () => command).execute();
    return this.gameOrder.interpret(orderObject);
  }
}

export class TargetGameObjectCommand implements OrderInterpret {
  constructor(private user: string, private action: OrderInterpret) {}

  interpret(orderObject: UObject): Command {
    const order = IoC.resolve<Order>('Adapter', 'Order', orderObject);
    const gameId = IoC.resolve<number>('targetGameId');
    const object = IoC.resolve<UObject>('Game.GetObject', gameId, order.getId(), this.user);
    IoC.resolve<Command>('IoC.Register', 'targetGameObject', () => object).execute();
    return this.action.interpret(orderObject);
  }
}

export class TargetGameCommand implements OrderInterpret {
  constructor(private gameId: number, private object: OrderInterpret) {}

  interpret(orderObject: UObject): Command {
    IoC.resolve<Command>('IoC.Register', 'targetGameId', () => this.gameId).execute();
    return this.object.interpret(orderObject);
  }
}

// export interface Order {
//   getId(): number;
//   getAction(): string;
//   getActionParameters(): unknown[];
// }

// IoC.resolve<Command>(
//   'IoC.Register',
//   'Order.Metadata',
//   () =>
//     ({
//       className: 'Order',
//       methods: ['getId', 'getAction', 'getActionParameters'],
//     } as MetaData<Order>),
// ).execute();
