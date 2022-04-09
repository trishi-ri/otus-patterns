import { Command } from '../core/command.model';
import { Direction } from '../core/direction.model';
import { Vector } from '../core/vector.model';

export class ChangeVelocityCommand implements Command {
  private velocityChangable: VelocityChangable;

  constructor(velocityChangable: VelocityChangable) {
    this.velocityChangable = velocityChangable;
  }

  execute(): void {
    const currentDurection = this.velocityChangable.getDirection();
    const angle = (2 * Math.PI * currentDurection.direction) / currentDurection.directionNumbers;

    const velocityModule = this.velocityChangable.getVelocityModule();
    const velocity = new Vector(
      Math.round(velocityModule * Math.cos(angle)),
      Math.round(velocityModule * Math.sin(angle)),
    );

    this.velocityChangable.setVelocity(velocity);
  }
}

export interface VelocityChangable {
  getDirection(): Direction;

  getVelocityModule(): number;

  setVelocity(velocity: Vector): void;
}
