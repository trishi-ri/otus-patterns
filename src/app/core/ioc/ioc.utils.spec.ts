import { IoC } from 'src/app/app.config';
import { MathUtils } from 'src/app/utils/math.utils';
import { Command } from '../command.model';
import { IoCUtils } from './ioc.utils';

describe('IoCUtils', () => {
  describe('tryInScope', () => {
    const initScopeName = IoC.scopeName;

    beforeEach(() => IoC.resolve<Command>('Scope.Current', initScopeName).execute());

    it('переданная функция выполнится внутри скоупа с указанным именем, а затем скоуп вернётся к предыдущему', () => {
      const newScopeName = `${MathUtils.randomId}`;
      IoC.resolve<Command>('Scope.New', newScopeName).execute();

      const testKey = 'One';
      const errors = IoCUtils.tryInScope(newScopeName, () => {
        IoC.resolve<Command>('IoC.Register', testKey, (): number => 1).execute();
      });
      expect(errors).toEqual([]);

      expect(IoC.scopeName).toBe(initScopeName);
      expect(() => IoC.resolve<number>(testKey)).toThrowError(
        `не удалось найти значение по ключу "${testKey}"`,
      );
      expect(IoC.keys.includes(testKey)).toBe(false);

      IoC.resolve<Command>('Scope.Current', newScopeName).execute();
      expect(IoC.resolve<number>(testKey)).toBe(1);
      expect(IoC.keys.includes(testKey)).toBe(true);
    });

    it('если при выполнении произошли ошибки, метод вернёт их, а в конце скоуп вернётся к предыдущему', () => {
      const newScopeName = `${MathUtils.randomId}`;
      IoC.resolve<Command>('Scope.New', newScopeName).execute();

      const testKey = 'OneWithError';
      const errors = IoCUtils.tryInScope(newScopeName, () => {
        IoC.resolve<Command>('IoC.Register', testKey, (): number => 1).execute();
        throw new Error('ошибка выполнения');
      });
      expect(errors).toEqual([new Error('ошибка выполнения')]);

      expect(IoC.scopeName).toBe(initScopeName);
      expect(() => IoC.resolve<number>(testKey)).toThrowError(
        `не удалось найти значение по ключу "${testKey}"`,
      );
      expect(IoC.keys.includes(testKey)).toBe(false);

      IoC.resolve<Command>('Scope.Current', newScopeName).execute();
      expect(IoC.resolve<number>(testKey)).toBe(1);
      expect(IoC.keys.includes(testKey)).toBe(true);
    });

    it('если указано имя несуществующего скоупа, то такой скоуп создастся, в конце скоуп вернётся к предыдущему', () => {
      const newScopeName = `${MathUtils.randomId}`;

      const testKey = 'OneWithError';
      const errors = IoCUtils.tryInScope(newScopeName, () => {
        IoC.resolve<Command>('IoC.Register', testKey, (): number => 1).execute();
      });
      expect(errors).toEqual([]);

      expect(IoC.scopeName).toBe(initScopeName);
      expect(() => IoC.resolve<number>(testKey)).toThrowError(
        `не удалось найти значение по ключу "${testKey}"`,
      );
      expect(IoC.keys.includes(testKey)).toBe(false);

      IoC.resolve<Command>('Scope.Current', newScopeName).execute();
      expect(IoC.resolve<number>(testKey)).toBe(1);
      expect(IoC.keys.includes(testKey)).toBe(true);
    });
  });
});
