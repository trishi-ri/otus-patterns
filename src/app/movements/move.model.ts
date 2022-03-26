import { Command } from '../core/command.model';
import { Vector } from '../core/vector.model';

export class Move implements Command {
  private movable: Movable;

  constructor(movable: Movable) {
    this.movable = movable;
  }

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
  setPosition(newPosition: Vector): Vector;

  getVelocity(): Vector;
}
