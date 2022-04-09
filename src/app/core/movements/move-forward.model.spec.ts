import { mock, instance, capture, when } from 'ts-mockito';
import { Vector } from '../vector.model';
import { ForwardMovable, MoveForwardCommand } from './move-forward.model';

describe('MoveForwardCommand', () => {
  let mockedForwardMovable: ForwardMovable;
  let forwardMovable: ForwardMovable;

  beforeEach(() => {
    mockedForwardMovable = mock<ForwardMovable>();
    forwardMovable = instance(mockedForwardMovable);
  });

  describe('execute', () => {
    it(
      'достаточно топлива, движение с позиции (1, 2) со скоростью (5, 3),' +
        ' сжигание топлива с 5 единиц со скоростью 1' +
        ' => будет установлена новая позиция (6, 5), запас топлива станет 4',
      () => {
        when(mockedForwardMovable.getFuel()).thenReturn(5);
        when(mockedForwardMovable.getFuelConsumption()).thenReturn(1);
        when(mockedForwardMovable.getPosition()).thenReturn(new Vector(1, 2));
        when(mockedForwardMovable.getVelocity()).thenReturn(new Vector(5, 3));

        const moveForward = new MoveForwardCommand(forwardMovable);
        moveForward.execute();

        const [newVector] = capture(mockedForwardMovable.setPosition).last();
        expect(newVector).toEqual(new Vector(6, 5));
        const [newFuel] = capture(mockedForwardMovable.setFuel).last();
        expect(newFuel).toEqual(4);
      },
    );
  });
});
