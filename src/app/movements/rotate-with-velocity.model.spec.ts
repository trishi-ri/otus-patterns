import { mock, instance, when, capture } from 'ts-mockito';
import { Direction } from '../core/direction.model';
import { Vector } from '../core/vector.model';
import {
  RotatableWithVelocityChangable,
  RotateWithVelocityCommand,
} from './rotate-with-velocity.model';

describe('RotateWithVelocityCommand', () => {
  let mockedRotatableWithVelocityChangable: RotatableWithVelocityChangable;
  let rotatableWithVelocityChangable: RotatableWithVelocityChangable;

  beforeEach(() => {
    mockedRotatableWithVelocityChangable = mock<RotatableWithVelocityChangable>();
    rotatableWithVelocityChangable = instance(mockedRotatableWithVelocityChangable);
  });

  describe('execute', () => {
    it(
      'поворот с направления (15, 360) на угол 30,' +
        ' изменение вектора скорости с направления (45, 360) с модулем скорости 2' +
        ' => будет установлено новое направление (45, 360) и новый вектор скорости (1, 1)',
      () => {
        when(mockedRotatableWithVelocityChangable.getDirection())
          .thenReturn(new Direction(15, 360))
          .thenReturn(new Direction(45, 360));
        when(mockedRotatableWithVelocityChangable.getAngularVelocity()).thenReturn(30);
        when(mockedRotatableWithVelocityChangable.getVelocityModule()).thenReturn(2);

        const rotateWithVelocity = new RotateWithVelocityCommand(rotatableWithVelocityChangable);
        rotateWithVelocity.execute();

        const [newVector] = capture(mockedRotatableWithVelocityChangable.setDirection).last();
        expect(newVector).toEqual(new Direction(45, 360));
        const [newFuel] = capture(mockedRotatableWithVelocityChangable.setVelocity).last();
        expect(newFuel).toEqual(new Vector(1, 1));
      },
    );
  });
});
