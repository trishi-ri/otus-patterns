import { mock, instance, when, capture, anything } from 'ts-mockito';
import { Vector } from '../core/vector.model';
import { BurnFuelCommand, FuelBurner } from './burn-fuel.model';
import { MoveCommand } from './move.model';

describe('BurnFuelCommand', () => {
  let mockedFuelBurner: FuelBurner;
  let fuelBurner: FuelBurner;

  beforeEach(() => {
    mockedFuelBurner = mock<FuelBurner>();
    fuelBurner = instance(mockedFuelBurner);
  });

  describe('execute', () => {
    it('сжигание топлива с 10 единиц со скоростью 2 => останется 8 единиц топлива', () => {
      when(mockedFuelBurner.getFuel()).thenReturn(10);
      when(mockedFuelBurner.getFuelConsumption()).thenReturn(2);

      const burnFuel = new BurnFuelCommand(fuelBurner);
      burnFuel.execute();

      const [newFuel] = capture(mockedFuelBurner.setFuel).last();
      expect(newFuel).toEqual(8);
    });

    describe('исключения', () => {
      it('при сжигании топлива не удалось получить текущий запас топлива => исключение "невозможно определить запас топлива"', () => {
        when(mockedFuelBurner.getFuel()).thenThrow(
          new Error('невозможно определить запас топлива'),
        );
        when(mockedFuelBurner.getFuelConsumption()).thenReturn(2);

        const burnFuel = new BurnFuelCommand(fuelBurner);

        expect(() => burnFuel.execute()).toThrowError('невозможно определить запас топлива');
      });

      it('при сжигании топлива не удалось получить скорость сжигания топлива => исключение "невозможно определить скорость сжигания топлива"', () => {
        when(mockedFuelBurner.getFuel()).thenReturn(10);
        when(mockedFuelBurner.getFuelConsumption()).thenThrow(
          new Error('невозможно определить скорость сжигания топлива'),
        );

        const burnFuel = new BurnFuelCommand(fuelBurner);

        expect(() => burnFuel.execute()).toThrowError(
          'невозможно определить скорость сжигания топлива',
        );
      });

      it('при выполнении движения не удалось установить новый запас топлива => исключение "невозможно сжечь топливо"', () => {
        when(mockedFuelBurner.getFuel()).thenReturn(10);
        when(mockedFuelBurner.getFuelConsumption()).thenReturn(2);
        when(mockedFuelBurner.setFuel(anything())).thenThrow(new Error('невозможно сжечь топливо'));

        const burnFuel = new BurnFuelCommand(fuelBurner);

        expect(() => burnFuel.execute()).toThrowError('невозможно сжечь топливо');
      });
    });
  });
});
