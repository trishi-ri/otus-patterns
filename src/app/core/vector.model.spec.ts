import { Vector } from './vector.model';

describe('Vector', () => {
  it('создание вектора', () => {
    const result = new Vector(3, 4);

    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });

  describe('plus', () => {
    it('сложение без векторов', () => {
      expect(Vector.plus()).toEqual(new Vector(0, 0));
    });

    it('сложение с одним вектором', () => {
      expect(Vector.plus(new Vector(1, 2))).toEqual(new Vector(1, 2));
    });

    it('сложение с несколькими векторами', () => {
      expect(
        Vector.plus(new Vector(1, 2), new Vector(-2, 3), new Vector(0, -3), new Vector(-3, -5)),
      ).toEqual(new Vector(-4, -3));
    });

    describe('исключения', () => {
      it('х или y после сложения больше максимума => исключение "сумма векторов больше максимума"', () => {
        expect(() =>
          Vector.plus(new Vector(Number.MAX_SAFE_INTEGER, 0), new Vector(1, 0)),
        ).toThrowError('сумма векторов больше максимума');
      });

      it('х или y после сложения меньше минимума => исключение "сумма векторов меньше минимума"', () => {
        expect(() =>
          Vector.plus(new Vector(Number.MIN_SAFE_INTEGER, 0), new Vector(-1, 0)),
        ).toThrowError('сумма векторов меньше минимума');
      });
    });
  });
});
