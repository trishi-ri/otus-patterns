import { MacroCommand } from '../core/macro-command.model';
import { ChangeVelocityCommand, VelocityChangable } from './change-velocity.model';
import { Rotatable, RotateCommand } from './rotate.model';

export class RotateWithVelocityCommand extends MacroCommand {
  constructor(rotatableWithVelocityChangable: RotatableWithVelocityChangable) {
    super([
      new RotateCommand(rotatableWithVelocityChangable),
      new ChangeVelocityCommand(rotatableWithVelocityChangable),
    ]);
  }
}

export interface RotatableWithVelocityChangable extends Rotatable, VelocityChangable {}
