import { instance, mock, verify } from 'ts-mockito';
import { Command } from '../core/command.model';
import { RepeatCommand } from './repeat-command.model';

describe('RepeatCommand', () => {
  it('команда запускает выполнение переданной команды', () => {
    const mockedCommand: Command = mock<Command>();
    const testCommand: Command = instance(mockedCommand);

    const command = new RepeatCommand(testCommand);
    command.execute();

    verify(mockedCommand.execute()).called();

    expect().nothing();
  });
});
