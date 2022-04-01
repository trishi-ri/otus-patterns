import { capture, spy } from 'ts-mockito';
import { LogError } from './log-error.model';

describe('LogError', () => {
  it('команда записывает ошибку в лог', () => {
    const error = new Error('ошибка для записи');
    const spiedConsole = spy(console);

    const command = new LogError(error);
    command.execute();

    const [loggedError] = capture(spiedConsole.log).last();
    expect(loggedError).toEqual(error);
  });
});
