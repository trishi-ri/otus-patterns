import { Direction } from '../core/direction.model';
import { Rotatable, Rotate } from './rotate.model';

class MockRotatable implements Rotatable {
  get direction(): Direction {
    throw new Error('Method not implemented.');
  }
  set direction(_: Direction) {
    throw new Error('Method not implemented.');
  }
  get angularVelocity(): number {
    throw new Error('Method not implemented.');
  }
}

describe('Rotate', () => {
  describe('execute', () => {
    it('поворот с направления (15, 360) на угол 30 => будет установлено новое направление (45, 360)', () => {
      const rotatable = new MockRotatable();
      spyOnProperty(rotatable, 'direction', 'get').and.callFake(() => new Direction(15, 360));
      spyOnProperty(rotatable, 'angularVelocity', 'get').and.callFake(() => 30);
      const setDirectionSpy = spyOnProperty(rotatable, 'direction', 'set').and.callFake(() => {});

      const rotate = new Rotate(rotatable);
      rotate.execute();

      expect(setDirectionSpy).toHaveBeenCalledWith(new Direction(45, 360));
    });

    describe('исключения', () => {
      it('при выполнении поворота не удалось получить направление => исключение "невозможно определить исходное направление"', () => {
        const rotatable = new MockRotatable();
        spyOnProperty(rotatable, 'direction', 'get').and.callFake(() => {
          throw new Error('невозможно определить исходное направление');
        });
        spyOnProperty(rotatable, 'angularVelocity', 'get').and.callFake(() => 0);
        spyOnProperty(rotatable, 'direction', 'set').and.callFake(() => {});

        const rotate = new Rotate(rotatable);

        expect(() => rotate.execute()).toThrowError('невозможно определить исходное направление');
      });

      it('при выполнении поворота не удалось получить угловую скорость => исключение "невозможно определить угловую скорость"', () => {
        const rotatable = new MockRotatable();
        spyOnProperty(rotatable, 'direction', 'get').and.callFake(() => new Direction(0, 360));
        spyOnProperty(rotatable, 'angularVelocity', 'get').and.callFake(() => {
          throw new Error('невозможно определить угловую скорость');
        });
        spyOnProperty(rotatable, 'direction', 'set').and.callFake(() => {});

        const rotate = new Rotate(rotatable);

        expect(() => rotate.execute()).toThrowError('невозможно определить угловую скорость');
      });

      it('при выполнении поворота не удалось установить новое направление => исключение "невозможно изменить направление"', () => {
        const rotatable = new MockRotatable();
        spyOnProperty(rotatable, 'direction', 'get').and.callFake(() => new Direction(0, 360));
        spyOnProperty(rotatable, 'angularVelocity', 'get').and.callFake(() => 0);
        spyOnProperty(rotatable, 'direction', 'set').and.callFake(() => {
          throw new Error('невозможно изменить направление');
        });

        const rotate = new Rotate(rotatable);

        expect(() => rotate.execute()).toThrowError('невозможно изменить направление');
      });
    });
  });
});
