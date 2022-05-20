import { spy, when } from 'ts-mockito';
import { Command } from '../command.model';
import { MacroCommand } from '../macro-command.model';
import { CommandQueue } from './command-queue.model';
import { HardStopQueue } from './hard-stop-queue.model';
import { SoftStopQueue } from './soft-stop-queue.model';
import { StartQueue } from './start-queue.model';

class TestCommand implements Command {
  execute(): void {}
}

describe('CommandQueue', () => {
  let queue: CommandQueue;
  let stateSpy: jasmine.Spy;
  const testCommand = new TestCommand();

  beforeEach(() => {
    queue = new CommandQueue();
    stateSpy = jasmine.createSpy();
    queue.statusLogger$.subscribe(stateSpy);
  });

  it('после команды старт поток запущен', () => {
    const mainCommandsQueue = new MacroCommand([
      { execute: () => queue.addCommand(testCommand, testCommand) },
      new StartQueue(queue),
    ]);
    mainCommandsQueue.execute();

    expect(stateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : TestCommand'],
      ['waiting'],
      ['executing : TestCommand'],
      ['waiting'],
    ]);
  });

  it('после команды hard stop, поток завершается', () => {
    const mainCommandsQueue = new MacroCommand([
      { execute: () => queue.addCommand(testCommand) },
      { execute: () => queue.addCommand(new HardStopQueue(queue)) },
      { execute: () => queue.addCommand(testCommand) },
      new StartQueue(queue),
    ]);
    mainCommandsQueue.execute();

    expect(stateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : TestCommand'],
      ['waiting'],
      ['executing : HardStopQueue'],
      ['hardStopping'],
      ['stopped'],
    ]);
    expect(queue.isEmpty).toBe(false);
  });

  it('после команды soft stop, поток завершается только после того, как все задачи закончились', () => {
    const mainCommandsQueue = new MacroCommand([
      { execute: () => queue.addCommand(testCommand) },
      { execute: () => queue.addCommand(new SoftStopQueue(queue)) },
      { execute: () => queue.addCommand(testCommand) },
      new StartQueue(queue),
    ]);
    mainCommandsQueue.execute();

    expect(stateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : TestCommand'],
      ['waiting'],
      ['executing : SoftStopQueue'],
      ['softStopping'],
      ['executing : TestCommand'],
      ['softStopping'],
      ['stopped'],
    ]);
    expect(queue.isEmpty).toBe(true);
  });

  it('после ошибки выполнение не прерывается', () => {
    const spiedCommand = spy(testCommand);
    when(spiedCommand.execute()).thenThrow(new Error('test error')).thenReturn(undefined);

    const mainCommandsQueue = new MacroCommand([
      { execute: () => queue.addCommand(testCommand, testCommand) },
      new StartQueue(queue),
    ]);
    mainCommandsQueue.execute();

    expect(stateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : TestCommand'],
      ['executingError : TestCommand : test error'],
      ['waiting'],
      ['executing : TestCommand'],
      ['waiting'],
    ]);
  });
});
