import { Direction } from '../core/direction.model';
import { Rotatable, RotateCommand } from './rotate.model';
import { anything, capture, instance, mock, when } from 'ts-mockito';

describe('RotateCommand', () => {
  let mockedRotatable: Rotatable;
  let rotatable: Rotatable;

  beforeEach(() => {
    mockedRotatable = mock<Rotatable>();
    rotatable = instance(mockedRotatable);
  });

  describe('execute', () => {
    it('поворот с направления (15, 360) на угол 30 => будет установлено новое направление (45, 360)', () => {
      when(mockedRotatable.getDirection()).thenReturn(new Direction(15, 360));
      when(mockedRotatable.getAngularVelocity()).thenReturn(30);

      const rotate = new RotateCommand(rotatable);
      rotate.execute();

      const [newDirection] = capture(mockedRotatable.setDirection).last();
      expect(newDirection).toEqual(new Direction(45, 360));
    });

    describe('исключения', () => {
      it('при выполнении поворота не удалось получить направление => исключение "невозможно определить исходное направление"', () => {
        when(mockedRotatable.getDirection()).thenThrow(
          new Error('невозможно определить исходное направление'),
        );
        when(mockedRotatable.getAngularVelocity()).thenReturn(30);

        const rotate = new RotateCommand(rotatable);

        expect(() => rotate.execute()).toThrowError('невозможно определить исходное направление');
      });

      it('при выполнении поворота не удалось получить угловую скорость => исключение "невозможно определить угловую скорость"', () => {
        when(mockedRotatable.getDirection()).thenReturn(new Direction(15, 360));
        when(mockedRotatable.getAngularVelocity()).thenThrow(
          new Error('невозможно определить угловую скорость'),
        );

        const rotate = new RotateCommand(rotatable);

        expect(() => rotate.execute()).toThrowError('невозможно определить угловую скорость');
      });

      it('при выполнении поворота не удалось установить новое направление => исключение "невозможно изменить направление"', () => {
        when(mockedRotatable.getDirection()).thenReturn(new Direction(15, 360));
        when(mockedRotatable.getAngularVelocity()).thenReturn(30);
        when(mockedRotatable.setDirection(anything())).thenThrow(
          new Error('невозможно изменить направление'),
        );

        const rotate = new RotateCommand(rotatable);

        expect(() => rotate.execute()).toThrowError('невозможно изменить направление');
      });
    });
  });
});
