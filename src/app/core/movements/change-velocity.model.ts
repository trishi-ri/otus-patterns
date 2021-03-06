import { Command } from '../command.model';
import { Direction } from '../direction.model';
import { Vector } from '../vector.model';

export class ChangeVelocityCommand implements Command {
  constructor(private velocityChangable: VelocityChangable) {}

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
