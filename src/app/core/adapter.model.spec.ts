import { capture, spy } from 'ts-mockito';
import { IoC } from '../app.config';
import { Adapter, MetaData } from './adapter.model';
import { Command } from './command.model';
import { Movable, MoveCommand } from './movements/move.model';
import { UObject } from './u-object.model';
import { Vector } from './vector.model';

describe('adapters', () => {
  IoC.resolve<Command>('IoC.Register', 'Adapter', <T>(uObject: UObject, metadata: MetaData<T>) => {
    return new Adapter<T>(uObject, metadata) as unknown;
  }).execute();

  it('генерация адаптера для Movable', () => {
    IoC.resolve<Command>('IoC.Register', 'MovableAdapter', (uObject: UObject): Movable => {
      const metadata: MetaData<Movable> = {
        className: 'Movable',
        methods: ['getPosition', 'getVelocity', 'setPosition'],
      };
      return IoC.resolve<Movable>('Adapter', uObject, metadata);
    }).execute();

    const uObject: UObject = getUObject();
    const adapter = IoC.resolve<Movable>('MovableAdapter', uObject);

    const move = new MoveCommand(adapter);
    move.execute();
    move.execute();
    expect(adapter.getPosition()).toEqual(new Vector(2, 6));
  });

  it('генерация адаптера для интерфейса с дополнительным методом (не геттер и не сеттер)', () => {
    IoC.resolve<Command>(
      'IoC.Register',
      'IMovableWithFinishAdapter',
      (uObject: UObject): MovableWithFinish => {
        const metadata: MetaData<MovableWithFinish> = {
          className: 'MovableWithFinish',
          methods: ['getPosition', 'getVelocity', 'setPosition', 'finish'],
          methodDefinitions: {
            finish: () => console.log('finish!'),
          },
        };
        return IoC.resolve<MovableWithFinish>('Adapter', uObject, metadata);
      },
    ).execute();

    const spiedConsole = spy(console);

    const uObject: UObject = getUObject();
    const adapter = IoC.resolve<MovableWithFinish>('IMovableWithFinishAdapter', uObject);
    const finishCommand = new FinishCommand(adapter);
    finishCommand.execute();

    const [loggedMessage] = capture(spiedConsole.log).last();
    expect(loggedMessage).toEqual('finish!');
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
});

interface MovableWithFinish {
  getPosition(): Vector;
  setPosition(newPosition: Vector): void;
  getVelocity(): Vector;
  finish(): void;
}

class FinishCommand implements Command {
  constructor(private finishable: MovableWithFinish) {}

  public execute(): void {
    try {
      this.finishable.finish();
    } catch (e) {
      throw e;
    }
  }
}
