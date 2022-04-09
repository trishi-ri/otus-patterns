import { Command } from '../core/command.model';

export class CheckFuelCommand implements Command {
  private fuelUser: FuelUser;
  constructor(fuelUser: FuelUser) {
    this.fuelUser = fuelUser;
  }

  public execute(): void {
    try {
      if (this.fuelUser.getFuel() - this.fuelUser.getFuelConsumption() < 0) {
        throw new Error('топлива недостаточно');
      }
    } catch (e) {
      throw e;
    }
  }
}

export interface FuelUser {
  getFuel(): number;

  getFuelConsumption(): number;
}
