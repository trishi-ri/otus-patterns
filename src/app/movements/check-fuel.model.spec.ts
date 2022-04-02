import { mock, instance, when } from 'ts-mockito';
import { CheckFuelCommand, FuelUser } from './check-fuel.model';

describe('CheckFuelCommand', () => {
  let mockedFuelUser: FuelUser;
  let fuelUser: FuelUser;

  beforeEach(() => {
    mockedFuelUser = mock<FuelUser>();
    fuelUser = instance(mockedFuelUser);
  });

  describe('execute', () => {
    it('проверка топлива с запасом 1 и расходом 1 => команда выполнена без ошибок', () => {
      when(mockedFuelUser.getFuel()).thenReturn(1);
      when(mockedFuelUser.getFuelConsumption()).thenReturn(1);

      const checkFuel = new CheckFuelCommand(fuelUser);
      checkFuel.execute();

      expect().nothing();
    });

    it('проверка топлива с запасом 1 и расходом 2 => команда выбрасывает исключение "топлива недостаточно"', () => {
      when(mockedFuelUser.getFuel()).thenReturn(1);
      when(mockedFuelUser.getFuelConsumption()).thenReturn(2);

      const checkFuel = new CheckFuelCommand(fuelUser);

      expect(() => checkFuel.execute()).toThrowError('топлива недостаточно');
    });

    describe('исключения', () => {
      it('при проверке топлива не удалось получить запас топлива => исключение "невозможно определить запас топлива"', () => {
        when(mockedFuelUser.getFuel()).thenThrow(new Error('невозможно определить запас топлива'));
        when(mockedFuelUser.getFuelConsumption()).thenReturn(2);

        const checkFuel = new CheckFuelCommand(fuelUser);

        expect(() => checkFuel.execute()).toThrowError('невозможно определить запас топлива');
      });

      it('при проверке топлива не удалось получить расход топлива => исключение "невозможно определить расход топлива"', () => {
        when(mockedFuelUser.getFuel()).thenReturn(2);
        when(mockedFuelUser.getFuelConsumption()).thenThrow(
          new Error('невозможно определить расход топлива'),
        );

        const checkFuel = new CheckFuelCommand(fuelUser);

        expect(() => checkFuel.execute()).toThrowError('невозможно определить расход топлива');
      });
    });
  });
});
