import { Direction } from './direction.model';

describe('Direction', () => {
  describe('создание направления', () => {
    it('создание', () => {
      const direction = new Direction(1, 360);

      expect(direction.direction).toBe(1);
      expect(direction.directionNumbers).toBe(360);
    });

    describe('исключения', () => {
      it('направление не целое число => исключение "направление должно быть целым числом"', () => {
        expect(() => new Direction(0.5, 360)).toThrowError('направление должно быть целым числом');
      });

      it('количество направлений не целое число => исключение "количество направлений должно быть целым числом"', () => {
        expect(() => new Direction(1, 0.5)).toThrowError(
          'количество направлений должно быть целым числом',
        );
      });

      it('количество направлений = 0 => исключение "количество направлений не должно быть 0"', () => {
        expect(() => new Direction(1, 0)).toThrowError('количество направлений не должно быть 0');
      });
    });
  });

  describe('next', () => {
    it('направление не меняется', () => {
      expect(new Direction(1, 360).next(0)).toEqual(new Direction(1, 360));
    });

    it('смена направления в положительную сторону', () => {
      expect(new Direction(1, 360).next(1)).toEqual(new Direction(2, 360));
    });

    it('смена направления в отрицательную сторону', () => {
      expect(new Direction(1, 360).next(-1)).toEqual(new Direction(0, 360));
    });

    describe('исключения', () => {
      it('уголовая скорость не целое число => исключение "угловая скорость должна быть целым числом"', () => {
        const direction = new Direction(0, 360);

        expect(() => direction.next(0.5)).toThrowError('угловая скорость должна быть целым числом');
      });
    });
  });
});
