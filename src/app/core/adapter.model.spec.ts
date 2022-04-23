import { capture, spy } from 'ts-mockito';
import { IoC } from '../app.config';
import { AdapterUtils, MetaData } from './adapter.model';
import { Command } from './command.model';
import { Movable, MoveCommand } from './movements/move.model';
import { UObject } from './u-object.model';
import { Vector } from './vector.model';

describe('adapters', () => {
  IoC.resolve<Command>('IoC.Register', 'Adapter', <T>(interfaceName: string, uObject: UObject) => {
    const metadata = IoC.resolve<MetaData<unknown>>(`${interfaceName}.Metadata`);
    const adapter = eval(AdapterUtils.getClassDefenition(metadata));
    return new adapter(uObject, IoC);
  }).execute();

  it('генерация адаптера для Movable', () => {
    const uObject: UObject = getUObject();
    const adapter = IoC.resolve<Movable>('Adapter', 'Movable', uObject);

    const move = new MoveCommand(adapter);
    move.execute();
    move.execute();
    expect(adapter.getPosition()).toEqual(new Vector(2, 6));
  });

  it('генерация адаптера для интерфейса с дополнительным методом (не геттер и не сеттер)', () => {
    const spiedConsole = spy(console);

    const uObject: UObject = getUObject();
    const adapter = IoC.resolve<MovableWithFinish>('Adapter', 'MovableWithFinish', uObject);
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

IoC.resolve<Command>(
  'IoC.Register',
  'MovableWithFinish.Metadata',
  () =>
    ({
      className: 'MovableWithFinish',
      methods: ['getPosition', 'getVelocity', 'setPosition', 'finish'],
      methodDefinitions: {
        finish: () => console.log('finish!'),
      },
    } as MetaData<MovableWithFinish>),
).execute();

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
