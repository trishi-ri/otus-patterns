import { instance, mock, spy, verify, when } from 'ts-mockito';
import { Movable, MoveCommand } from './movements/move.model';
import { Rotatable, RotateCommand } from './movements/rotate.model';
import { MacroCommand } from './macro-command.model';

describe('MacroCommand', () => {
  it('Ошибка одной команды приводит к завершению выполнения и выбрасывает исключение', () => {
    const spiedRotateCommand = spy(new RotateCommand(mock<Rotatable>()));
    when(spiedRotateCommand.execute())
      .thenThrow(new Error('ошибка первой команды'))
      .thenCall(() => {});
    const spiedMoveCommand = spy(new MoveCommand(mock<Movable>()));

    const macroCommand = new MacroCommand([
      instance(spiedRotateCommand),
      new MoveCommand(instance(mock<Movable>())),
    ]);

    expect(() => macroCommand.execute()).toThrowError('ошибка первой команды');

    verify(spiedRotateCommand.execute()).once();
    verify(spiedMoveCommand.execute()).never();
  });
});
