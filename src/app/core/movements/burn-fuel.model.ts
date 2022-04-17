import { Command } from '../command.model';

export class BurnFuelCommand implements Command {
  constructor(private fuelBurner: FuelBurner) {}

  public execute(): void {
    try {
      this.fuelBurner.setFuel(this.fuelBurner.getFuel() - this.fuelBurner.getFuelConsumption());
    } catch (e) {
      throw e;
    }
  }
}

export interface FuelBurner {
  getFuel(): number;
  setFuel(fuel: number): void;

  getFuelConsumption(): number;
}
