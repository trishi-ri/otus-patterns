import { finalize, of } from 'rxjs';
import { Command } from '../command.model';
import { IoCContainer } from './ioc-container.model';

describe('IoCContainer', () => {
  let IoC: IoCContainer;

  beforeEach(() => {
    IoC = new IoCContainer();
  });

  it('регистрация зависимостей', () => {
    IoC.resolve<Command>('IoC.Register', 'MaxUsers', () => 100).execute();

    expect(IoC.keys).toEqual(['IoC.Register', 'Scope.New', 'Scope.Current', 'MaxUsers']);
  });

  it('разрешение зависимостей', () => {
    const maxUsers = 100;
    IoC.resolve<Command>('IoC.Register', 'MaxUsers', () => maxUsers).execute();

    const result = IoC.resolve<number>('MaxUsers');

    expect(result).toBe(maxUsers);
  });

  describe('работа со скоупами', () => {
    it('добавление скоупа', () => {
      IoC.resolve<Command>('Scope.New', 'game 1').execute();

      expect(IoC.scoupesNames).toEqual(['default', 'game 1']);
    });

    it('установка скоупа', () => {
      const newScopeName = 'game 1';
      IoC.resolve<Command>('Scope.New', newScopeName).execute();
      IoC.resolve<Command>('Scope.Current', newScopeName).execute();

      expect(IoC.scopeName).toBe(newScopeName);
    });

    it('регистрация зависимостей в новом скоупе', () => {
      const gameName = 'game 1';
      IoC.resolve<Command>('Scope.New', gameName).execute();
      IoC.resolve<Command>('Scope.Current', gameName).execute();
      IoC.resolve<Command>('IoC.Register', 'MaxUsers', () => 50).execute();

      expect(IoC.keys).toEqual(['MaxUsers']);
    });

    describe('разрешение зависимостей', () => {
      const defaultMaxUsers = 100;

      beforeEach(() =>
        IoC.resolve<Command>('IoC.Register', 'MaxUsers', () => defaultMaxUsers).execute(),
      );

      it('если в текущем скоупе есть значение, то вернётся оно', () => {
        const gameName = 'game 1',
          gameMaxUsers = 50;
        IoC.resolve<Command>('Scope.New', gameName).execute();
        IoC.resolve<Command>('Scope.Current', gameName).execute();
        IoC.resolve<Command>('IoC.Register', 'MaxUsers', () => gameMaxUsers).execute();

        expect(IoC.resolve<number>('MaxUsers')).toBe(gameMaxUsers);
      });

      it('если в текущем скоупе нет значения, то вернётся значение из родительского скоупа', () => {
        const gameName = 'game 1';
        IoC.resolve<Command>('Scope.New', gameName).execute();
        IoC.resolve<Command>('Scope.Current', gameName).execute();

        expect(IoC.resolve<number>('MaxUsers')).toBe(defaultMaxUsers);
      });
    });
  });

  it('несколько потоков', () => {
    const defaultScope = IoC.scopeName,
      defaultMaxUsers = 100;
    IoC.resolve<Command>('IoC.Register', 'MaxUsers', () => defaultMaxUsers).execute();

    const newScopeData = { name: 'other scope', maxUsers: 50 };
    of(newScopeData)
      .pipe(finalize(() => IoC.resolve<Command>('Scope.Current', defaultScope).execute()))
      .subscribe(({ name, maxUsers }) => {
        IoC.resolve<Command>('Scope.New', name).execute();
        IoC.resolve<Command>('Scope.Current', name).execute();
        IoC.resolve<Command>('IoC.Register', 'MaxUsers', () => maxUsers).execute();

        expect(IoC.scopeName).toBe(newScopeData.name);
        expect(IoC.resolve<number>('MaxUsers')).toBe(newScopeData.maxUsers);
      });

    expect(IoC.scopeName).toBe(defaultScope);
    expect(IoC.resolve<number>('MaxUsers')).toBe(defaultMaxUsers);
  });

  describe('исключения', () => {
    it('не удалось найти значение по ключу', () => {
      const unexpectedCommand = 'unexpected command';

      expect(() => IoC.resolve(unexpectedCommand)).toThrowError(
        `не удалось найти значение по ключу "${unexpectedCommand}"`,
      );
    });

    it('не удалось найти скоуп по имени', () => {
      const unexpectedScopeName = 'unexpected scope name';

      expect(() =>
        IoC.resolve<Command>('Scope.Current', unexpectedScopeName).execute(),
      ).toThrowError(`не удалось найти скоуп по имени "${unexpectedScopeName}"`);
    });
  });
});
