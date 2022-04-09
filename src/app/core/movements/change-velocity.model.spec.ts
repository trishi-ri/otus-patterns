import { mock, instance, when, capture, anything } from 'ts-mockito';
import { Direction } from '../direction.model';
import { Vector } from '../vector.model';
import { VelocityChangable, ChangeVelocityCommand } from './change-velocity.model';

describe('ChangeVelocityCommand', () => {
  let mockedVelocityChangable: VelocityChangable;
  let velocityChangable: VelocityChangable;

  beforeEach(() => {
    mockedVelocityChangable = mock<VelocityChangable>();
    velocityChangable = instance(mockedVelocityChangable);
  });

  describe('execute', () => {
    it(
      'изменение вектора скорости с направления (45, 360) с модулем скорости 2 =>' +
        ' будет установлен новый вектор скорости (1, 1)',
      () => {
        when(mockedVelocityChangable.getDirection()).thenReturn(new Direction(45, 360));
        when(mockedVelocityChangable.getVelocityModule()).thenReturn(2);

        const changeVelocity = new ChangeVelocityCommand(velocityChangable);
        changeVelocity.execute();

        const [newVector] = capture(mockedVelocityChangable.setVelocity).last();
        expect(newVector).toEqual(new Vector(1, 1));
      },
    );

    describe('исключения', () => {
      it('при изменении вектора скорости не удалось получить направление => исключение "невозможно определить направление"', () => {
        when(mockedVelocityChangable.getDirection()).thenThrow(
          new Error('невозможно определить направление'),
        );
        when(mockedVelocityChangable.getVelocityModule()).thenReturn(2);

        const changeVelocity = new ChangeVelocityCommand(velocityChangable);

        expect(() => changeVelocity.execute()).toThrowError('невозможно определить направление');
      });

      it('при изменении вектора скорости не удалось получить модуль скорости => исключение "невозможно определить модуль скорости"', () => {
        when(mockedVelocityChangable.getDirection()).thenReturn(new Direction(45, 360));
        when(mockedVelocityChangable.getVelocityModule()).thenThrow(
          new Error('невозможно определить модуль скорости'),
        );

        const changeVelocity = new ChangeVelocityCommand(velocityChangable);

        expect(() => changeVelocity.execute()).toThrowError(
          'невозможно определить модуль скорости',
        );
      });

      it('при изменении вектора скорости не удалось установить новый вектор => исключение "невозможно изменить вектор скорости"', () => {
        when(mockedVelocityChangable.getDirection()).thenReturn(new Direction(45, 360));
        when(mockedVelocityChangable.getVelocityModule()).thenReturn(2);
        when(mockedVelocityChangable.setVelocity(anything())).thenThrow(
          new Error('невозможно изменить вектор скорости'),
        );

        const changeVelocity = new ChangeVelocityCommand(velocityChangable);

        expect(() => changeVelocity.execute()).toThrowError('невозможно изменить вектор скорости');
      });
    });
  });
});
