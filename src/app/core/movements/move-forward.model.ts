import { MacroCommand } from '../macro-command.model';
import { BurnFuelCommand, FuelBurner } from './burn-fuel.model';
import { CheckFuelCommand, FuelUser } from './check-fuel.model';
import { Movable, MoveCommand } from './move.model';

export class MoveForwardCommand extends MacroCommand {
  constructor(forwardMovable: ForwardMovable) {
    super([
      new CheckFuelCommand(forwardMovable),
      new MoveCommand(forwardMovable),
      new BurnFuelCommand(forwardMovable),
    ]);
  }
}

export interface ForwardMovable extends FuelUser, Movable, FuelBurner {}
