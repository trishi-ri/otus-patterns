import { Movable, Move } from './move.model';
import { Vector } from '../core/vector.model';

class MockMovable implements Movable {
  get position(): Vector {
    throw new Error('Method not implemented.');
  }
  set position(_: Vector) {
    throw new Error('Method not implemented.');
  }
  get velocity(): Vector {
    throw new Error('Method not implemented.');
  }
}

describe('Move', () => {
  describe('execute', () => {
    it('движение с позиции (12, 5) со скоростью (-7, 3) => будет установлена новая позиция (5, 8)', () => {
      const movable = new MockMovable();
      spyOnProperty(movable, 'position', 'get').and.callFake(() => new Vector(12, 5));
      spyOnProperty(movable, 'velocity', 'get').and.callFake(() => new Vector(-7, 3));
      const setPositionSpy = spyOnProperty(movable, 'position', 'set').and.callFake(() => {});

      const move = new Move(movable);
      move.execute();

      expect(setPositionSpy).toHaveBeenCalledWith(new Vector(5, 8));
    });

    describe('исключения', () => {
      it('при выполнении движения не удалось получить позицию => исключение "невозможно определить исходную позицию"', () => {
        const movable = new MockMovable();
        spyOnProperty(movable, 'position', 'get').and.callFake(() => {
          throw new Error('невозможно определить исходную позицию');
        });
        spyOnProperty(movable, 'velocity', 'get').and.callFake(() => new Vector(0, 0));
        spyOnProperty(movable, 'position', 'set').and.callFake(() => {});

        const move = new Move(movable);

        expect(() => move.execute()).toThrowError('невозможно определить исходную позицию');
      });

      it('при выполнении движения не удалось получить скорость => исключение "невозможно определить скорость"', () => {
        const movable = new MockMovable();
        spyOnProperty(movable, 'position', 'get').and.callFake(() => new Vector(0, 0));
        spyOnProperty(movable, 'velocity', 'get').and.callFake(() => {
          throw new Error('невозможно определить скорость');
        });
        spyOnProperty(movable, 'position', 'set').and.callFake(() => {});

        const move = new Move(movable);

        expect(() => move.execute()).toThrowError('невозможно определить скорость');
      });

      it('при выполнении движения не удалось установить новую позицию => исключение "невозможно изменить положение в пространстве"', () => {
        const movable = new MockMovable();
        spyOnProperty(movable, 'position', 'get').and.callFake(() => new Vector(0, 0));
        spyOnProperty(movable, 'velocity', 'get').and.callFake(() => new Vector(0, 0));
        spyOnProperty(movable, 'position', 'set').and.callFake(() => {
          throw new Error('невозможно изменить положение в пространстве');
        });

        const move = new Move(movable);

        expect(() => move.execute()).toThrowError('невозможно изменить положение в пространстве');
      });
    });
  });
});
