import { Subject } from 'rxjs';
import { mock, instance, when, anything, verify, spy, capture, resetCalls } from 'ts-mockito';
import { Command } from '../core/command.model';
import { STRATEGIES } from './strategies';
import { ExceptionHandler } from './exception-handler.model';
import { HandlerCommandsUtils } from './exception-handler.utils';

describe('ErrorHandler', () => {
  describe('стратегии обработки ошибок', () => {
    const spiedHandlerUtils = spy(HandlerCommandsUtils);
    const spiedConsole = spy(console);
    let mockedCommand: Command;
    let queue$: Subject<Command>;

    const mockedQueueHandler = mock<ExceptionHandler>();
    const queueHandler = instance(mockedQueueHandler);
    when(mockedQueueHandler.handle(anything(), anything())).thenCall(
      (error: Error, command: Command) => {
        const key = HandlerCommandsUtils.getKeyForStrategy(error, command);
        STRATEGIES[key](error, command, queue$);
      },
    );

    beforeEach(() => {
      mockedCommand = mock<Command>();
      queue$ = new Subject<Command>();
      resetCalls(spiedConsole);

      queue$.subscribe((command: Command) => {
        try {
          command.execute();
        } catch (e) {
          if (e instanceof Error) {
            queueHandler.handle(e, command);
          }
        }
      });
    });

    it('log => при получении ошибки записать в лог', () => {
      when(mockedCommand.execute()).thenThrow(new Error('первая ошибка'));
      when(spiedHandlerUtils.getKeyForStrategy(anything(), anything())).thenReturn('queueNextLog');

      queue$.next(instance(mockedCommand));

      verify(mockedCommand.execute()).once();
      verify(spiedConsole.log(anything())).once();
      verify(spiedConsole.log(anything())).calledAfter(mockedCommand.execute());

      expect(capture(spiedConsole.log).last()).toEqual([new Error('первая ошибка')]);
    });

    it('repeat => при получении ошибки повторить команду', () => {
      when(mockedCommand.execute())
        .thenThrow(new Error('первая ошибка'))
        .thenCall(() => {});
      when(spiedHandlerUtils.getKeyForStrategy(anything(), anything())).thenReturn(
        'queueNextRepeat',
      );

      queue$.next(instance(mockedCommand));

      verify(mockedCommand.execute()).twice();

      expect().nothing();
    });

    it('repeatAndLog => при получении ошибки повторить команду, если снова ошибка, то записать в лог', () => {
      when(mockedCommand.execute())
        .thenThrow(new Error('первая ошибка'))
        .thenThrow(new Error('вторая ошибка'));
      when(spiedHandlerUtils.getKeyForStrategy(anything(), anything())).thenReturn(
        'queueNextRepeatAndLog',
      );

      queue$.next(instance(mockedCommand));

      verify(mockedCommand.execute()).twice();
      verify(spiedConsole.log(anything())).once();
      verify(spiedConsole.log(anything())).calledAfter(mockedCommand.execute());

      expect(capture(spiedConsole.log).last()).toEqual([new Error('вторая ошибка')]);
    });

    it(
      'repeatTwiceAndLog => при получении ошибки повторить команду, ' +
        'если снова ошибка, то ещё раз повторить, если дважды ошибка, то записать в лог',
      () => {
        when(mockedCommand.execute())
          .thenThrow(new Error('первая ошибка'))
          .thenThrow(new Error('вторая ошибка'))
          .thenThrow(new Error('третья ошибка'));
        when(spiedHandlerUtils.getKeyForStrategy(anything(), anything())).thenReturn(
          'queueNextRepeatTwiceAndLog',
        );

        queue$.next(instance(mockedCommand));

        verify(mockedCommand.execute()).thrice();
        verify(spiedConsole.log(anything())).once();
        verify(spiedConsole.log(anything())).calledAfter(mockedCommand.execute());

        expect(capture(spiedConsole.log).last()).toEqual([new Error('третья ошибка')]);
      },
    );
  });
});
