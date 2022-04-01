import { Subject } from 'rxjs';
import { mock, instance, when, anything, verify, spy, capture, resetCalls } from 'ts-mockito';
import { Command } from '../core/command.model';
import { Movable, MoveCommand } from '../movements/move.model';
import { Rotatable, RotateCommand } from '../movements/rotate.model';
import { QueueExceptionHandler } from './queue-exception-handler.model';

describe('QueueExceptionHandler', () => {
  describe('стратегии обработки ошибок', () => {
    const spiedConsole = spy(console);
    let queue$: Subject<Command>;
    let queueExceptionHandler: QueueExceptionHandler;

    beforeEach(() => {
      queue$ = new Subject<Command>();
      queueExceptionHandler = new QueueExceptionHandler(queue$);
      resetCalls(spiedConsole);

      queue$.subscribe((command: Command) => {
        try {
          command.execute();
        } catch (e) {
          if (e instanceof Error) {
            queueExceptionHandler.handle(e, command);
          }
        }
      });
    });

    it('ошибка при перемещении => при получении ошибки записать в лог', () => {
      const spiedCommand = spy(new MoveCommand(mock<Movable>()));
      when(spiedCommand.execute()).thenThrow(new Error('первая ошибка'));

      queue$.next(instance(spiedCommand));

      verify(spiedCommand.execute()).once();
      verify(spiedConsole.log(anything())).once();
      verify(spiedConsole.log(anything())).calledAfter(spiedCommand.execute());

      expect(capture(spiedConsole.log).last()).toEqual([new Error('первая ошибка')]);
    });

    it('ошибка при повороте => при получении ошибки повторить команду', () => {
      const spiedCommand = spy(new RotateCommand(mock<Rotatable>()));
      when(spiedCommand.execute())
        .thenThrow(new Error('первая ошибка'))
        .thenCall(() => {});

      queue$.next(instance(spiedCommand));

      verify(spiedCommand.execute()).twice();

      expect().nothing();
    });

    it('повторная ошибка при повтороте => при получении ошибки повторить команду, если снова ошибка, то записать в лог', () => {
      const spiedCommand = spy(new RotateCommand(mock<Rotatable>()));
      when(spiedCommand.execute())
        .thenThrow(new Error('первая ошибка'))
        .thenThrow(new Error('вторая ошибка'));

      queue$.next(instance(spiedCommand));

      verify(spiedCommand.execute()).twice();
      verify(spiedConsole.log(anything())).once();
      verify(spiedConsole.log(anything())).calledAfter(spiedCommand.execute());

      expect(capture(spiedConsole.log).last()).toEqual([new Error('вторая ошибка')]);
    });

    it(
      'повторная ошибка при повороте (ошибка диапазона) => ' +
        'при получении ошибки повторить команду, если ошибка диапазона, то ещё раз повторить, ' +
        'если дважды ошибка, то записать в лог',
      () => {
        const spiedCommand = spy(new RotateCommand(mock<Rotatable>()));
        when(spiedCommand.execute())
          .thenThrow(new Error('первая ошибка'))
          .thenThrow(new RangeError('вторая ошибка'))
          .thenThrow(new Error('третья ошибка'));

        queue$.next(instance(spiedCommand));

        verify(spiedCommand.execute()).thrice();
        verify(spiedConsole.log(anything())).once();
        verify(spiedConsole.log(anything())).calledAfter(spiedCommand.execute());

        expect(capture(spiedConsole.log).last()).toEqual([new Error('третья ошибка')]);
      },
    );
  });
});
