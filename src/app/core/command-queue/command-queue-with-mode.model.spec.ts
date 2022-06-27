import { Command } from '../command.model';
import { MacroCommand } from '../macro-command.model';
import { CommandQueueWithMode } from './command-queue-with-mode.model';
import { CommandQueue } from './command-queue.model';
import { HardStopQueue } from './hard-stop-queue.model';
import { MoveTo } from './move-to.model';
import { Run } from './run.model';
import { StartQueue } from './start-queue.model';

class TestCommand implements Command {
  execute(): void {}
}
class TestMovedToCommand implements Command {
  execute(): void {}
}

describe('CommandQueueWithMode', () => {
  let queue: CommandQueueWithMode;
  let stateSpy: jasmine.Spy;
  const testCommand = new TestCommand();

  beforeEach(() => {
    queue = new CommandQueueWithMode();
    stateSpy = jasmine.createSpy();
    queue.statusLogger$.subscribe(stateSpy);
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

  it('после команды move to поток переходит в режим передачи команд в другой поток', () => {
    const targetQueue = new CommandQueue();
    const targetQueueStateSpy = jasmine.createSpy();
    targetQueue.statusLogger$.subscribe(targetQueueStateSpy);
    const testMovedToCommand = new TestMovedToCommand();

    const mainCommandsQueue = new MacroCommand([
      { execute: () => queue.addCommand(testCommand) },
      { execute: () => queue.addCommand(new MoveTo(queue, targetQueue)) },
      { execute: () => queue.addCommand(testMovedToCommand) },
      new StartQueue(queue),
    ]);
    mainCommandsQueue.execute();

    expect(stateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : TestCommand'],
      ['waiting'],
      ['executing : MoveTo'],
      ['waiting'],
    ]);
    expect(queue.isEmpty).toBe(true);

    expect(targetQueue.isEmpty).toBe(false);
    targetQueue.start();
    expect(targetQueueStateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : TestMovedToCommand'],
      ['waiting'],
    ]);
    expect(targetQueue.isEmpty).toBe(true);
  });

  it('после команды run, поток переходит в обычный режим выполнения команд', () => {
    const targetQueue = new CommandQueue();
    const targetQueueStateSpy = jasmine.createSpy();
    targetQueue.statusLogger$.subscribe(targetQueueStateSpy);
    const testMovedToCommand = new TestMovedToCommand();
    new MoveTo(queue, targetQueue).execute();

    const mainCommandsQueue = new MacroCommand([
      { execute: () => queue.addCommand(testMovedToCommand) },
      { execute: () => queue.addCommand(new Run(queue)) },
      { execute: () => queue.addCommand(testCommand) },
      new StartQueue(queue),
    ]);
    mainCommandsQueue.execute();

    expect(targetQueue.isEmpty).toBe(false);
    targetQueue.start();
    expect(targetQueueStateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : TestMovedToCommand'],
      ['waiting'],
      ['executing : Run'],
      ['waiting'],
    ]);
    expect(targetQueue.isEmpty).toBe(true);

    expect(stateSpy.calls.allArgs()).toEqual([
      ['init'],
      ['waiting'],
      ['executing : TestCommand'],
      ['waiting'],
    ]);
    expect(queue.isEmpty).toBe(true);
  });
});
