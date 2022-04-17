import { Command } from '../command.model';
import { Vector } from '../vector.model';

export class MoveCommand implements Command {
  constructor(private movable: Movable) {}

  public execute(): void {
    try {
      this.movable.setPosition(Vector.plus(this.movable.getPosition(), this.movable.getVelocity()));
    } catch (e) {
      throw e;
    }
  }
}

export interface Movable {
  getPosition(): Vector;
  setPosition(newPosition: Vector): void;

  getVelocity(): Vector;
}
