import { MathUtils } from './math.utils';

describe('MathUtils', () => {
  describe('solveQuadraticEquation', () => {
    describe('поиск корней', () => {
      it('x^2+1 = 0 => корней нет', () => {
        const a = 1,
          b = 0,
          c = 1;

        const result = MathUtils.solveQuadraticEquation(a, b, c);

        expect(result).toEqual([]);
      });

      it('x^2-1 = 0 => два корня кратности 1 (x1=1, x2=-1)', () => {
        const a = 1,
          b = 0,
          c = -1;

        const result = MathUtils.solveQuadraticEquation(a, b, c);

        expect(result).toEqual([1, -1]);
      });

      it('x^2+0.2x+0.01 = 0 => один корень кратности 2 (x1=x2=-0.1)', () => {
        const a = 1,
          b = 0.2,
          c = 0.01;

        const result = MathUtils.solveQuadraticEquation(a, b, c);

        expect(result).toEqual([-0.1]);
      });
    });

    describe('обработка исключений', () => {
      it(`a = 1e-20 (близкое к 0 значение) => исключение 'коэффициент "a" не может быть равен 0'`, () => {
        const a = 1e-20,
          b = 2,
          c = 1;

        expect(() => MathUtils.solveQuadraticEquation(a, b, c)).toThrowError(
          'коэффициент "a" не может быть равен 0',
        );
      });

      describe('все коэффициенты должны быть числами', () => {
        const expectedError = (coefficient: string) =>
          `коэффициент "${coefficient}" должен быть числом`;

        [
          {
            coefficient: 'a',
            args: [NaN, 1, 1],
          },
          {
            coefficient: 'b',
            args: [1, NaN, 1],
          },
          {
            coefficient: 'c',
            args: [1, 1, NaN],
          },
        ].forEach(({ coefficient, args: [a, b, c] }) => {
          it(`${coefficient} = NaN => исключение '${expectedError(coefficient)}'`, () => {
            expect(() => MathUtils.solveQuadraticEquation(a, b, c)).toThrowError(
              expectedError(coefficient),
            );
          });
        });
      });

      describe('все коэффициенты должны быть конечными числами', () => {
        const expectedError = (coefficient: string) =>
          `коэффициент "${coefficient}" должен быть конечным числом`;

        [
          {
            coefficient: 'a',
            args: [Infinity, 1, 1],
          },
          {
            coefficient: 'b',
            args: [1, Infinity, 1],
          },
          {
            coefficient: 'c',
            args: [1, 1, Infinity],
          },
        ].forEach(({ coefficient, args: [a, b, c] }) => {
          it(`${coefficient} = Infinity => исключение '${expectedError(coefficient)}'`, () => {
            expect(() => MathUtils.solveQuadraticEquation(a, b, c)).toThrowError(
              expectedError(coefficient),
            );
          });
        });

        [
          {
            coefficient: 'a',
            args: [-Infinity, 1, 1],
          },
          {
            coefficient: 'b',
            args: [1, -Infinity, 1],
          },
          {
            coefficient: 'c',
            args: [1, 1, -Infinity],
          },
        ].forEach(({ coefficient, args: [a, b, c] }) => {
          it(`${coefficient} = -Infinity => исключение '${expectedError(coefficient)}'`, () => {
            expect(() => MathUtils.solveQuadraticEquation(a, b, c)).toThrowError(
              expectedError(coefficient),
            );
          });
        });
      });

      describe('все коэффициенты не должны быть граничными числами', () => {
        const expectedError = (coefficient: string) =>
          `коэффициент "${coefficient}" не должен быть граничным числом`;

        [
          {
            coefficient: 'a',
            args: [Number.MAX_VALUE, 1, 1],
          },
          {
            coefficient: 'b',
            args: [1, Number.MAX_VALUE, 1],
          },
          {
            coefficient: 'c',
            args: [1, 1, Number.MAX_VALUE],
          },
        ].forEach(({ coefficient, args: [a, b, c] }) => {
          it(`${coefficient} = MAX_VALUE => исключение '${expectedError(coefficient)}'`, () => {
            expect(() => MathUtils.solveQuadraticEquation(a, b, c)).toThrowError(
              expectedError(coefficient),
            );
          });
        });

        [
          {
            coefficient: 'a',
            args: [Number.MIN_VALUE, 1, 1],
          },
          {
            coefficient: 'b',
            args: [1, Number.MIN_VALUE, 1],
          },
          {
            coefficient: 'c',
            args: [1, 1, Number.MIN_VALUE],
          },
        ].forEach(({ coefficient, args: [a, b, c] }) => {
          it(`${coefficient} = MIN_VALUE => исключение '${expectedError(coefficient)}'`, () => {
            expect(() => MathUtils.solveQuadraticEquation(a, b, c)).toThrowError(
              expectedError(coefficient),
            );
          });
        });

        [
          {
            coefficient: 'a',
            args: [Number.MAX_SAFE_INTEGER, 1, 1],
          },
          {
            coefficient: 'b',
            args: [1, Number.MAX_SAFE_INTEGER, 1],
          },
          {
            coefficient: 'c',
            args: [1, 1, Number.MAX_SAFE_INTEGER],
          },
        ].forEach(({ coefficient, args: [a, b, c] }) => {
          it(`${coefficient} = MAX_SAFE_INTEGER => исключение '${expectedError(
            coefficient,
          )}'`, () => {
            expect(() => MathUtils.solveQuadraticEquation(a, b, c)).toThrowError(
              expectedError(coefficient),
            );
          });
        });

        [
          {
            coefficient: 'a',
            args: [Number.MIN_SAFE_INTEGER, 1, 1],
          },
          {
            coefficient: 'b',
            args: [1, Number.MIN_SAFE_INTEGER, 1],
          },
          {
            coefficient: 'c',
            args: [1, 1, Number.MIN_SAFE_INTEGER],
          },
        ].forEach(({ coefficient, args: [a, b, c] }) => {
          it(`${coefficient} = MIN_SAFE_INTEGER => исключение '${expectedError(
            coefficient,
          )}'`, () => {
            expect(() => MathUtils.solveQuadraticEquation(a, b, c)).toThrowError(
              expectedError(coefficient),
            );
          });
        });
      });
    });
  });
});
