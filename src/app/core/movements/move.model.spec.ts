import { Movable, MoveCommand } from './move.model';
import { Vector } from '../vector.model';
import { anything, capture, instance, mock, when } from 'ts-mockito';

describe('MoveCommand', () => {
  let mockedMovable: Movable;
  let movable: Movable;

  beforeEach(() => {
    mockedMovable = mock<Movable>();
    movable = instance(mockedMovable);
  });

  describe('execute', () => {
    it('движение с позиции (12, 5) со скоростью (-7, 3) => будет установлена новая позиция (5, 8)', () => {
      when(mockedMovable.getPosition()).thenReturn(new Vector(12, 5));
      when(mockedMovable.getVelocity()).thenReturn(new Vector(-7, 3));

      const move = new MoveCommand(movable);
      move.execute();

      const [newVector] = capture(mockedMovable.setPosition).last();
      expect(newVector).toEqual(new Vector(5, 8));
    });

    describe('исключения', () => {
      it('при выполнении движения не удалось получить позицию => исключение "невозможно определить исходную позицию"', () => {
        when(mockedMovable.getPosition()).thenThrow(
          new Error('невозможно определить исходную позицию'),
        );
        when(mockedMovable.getVelocity()).thenReturn(new Vector(-7, 3));

        const move = new MoveCommand(movable);

        expect(() => move.execute()).toThrowError('невозможно определить исходную позицию');
      });

      it('при выполнении движения не удалось получить скорость => исключение "невозможно определить скорость"', () => {
        when(mockedMovable.getPosition()).thenReturn(new Vector(12, 5));
        when(mockedMovable.getVelocity()).thenThrow(new Error('невозможно определить скорость'));

        const move = new MoveCommand(movable);

        expect(() => move.execute()).toThrowError('невозможно определить скорость');
      });

      it('при выполнении движения не удалось установить новую позицию => исключение "невозможно изменить положение в пространстве"', () => {
        when(mockedMovable.getPosition()).thenReturn(new Vector(12, 5));
        when(mockedMovable.getVelocity()).thenReturn(new Vector(-7, 3));
        when(mockedMovable.setPosition(anything())).thenThrow(
          new Error('невозможно изменить положение в пространстве'),
        );

        const move = new MoveCommand(movable);

        expect(() => move.execute()).toThrowError('невозможно изменить положение в пространстве');
      });
    });
  });
});
