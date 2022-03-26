import { Vector } from '../core/vector.model';

export class Move {
  private movable: Movable;

  constructor(movable: Movable) {
    this.movable = movable;
  }

  public execute(): void {
    try {
      this.movable.position = Vector.plus(this.movable.position, this.movable.velocity);
    } catch (e) {
      throw e;
    }
  }
}

export interface Movable {
  get position(): Vector;
  set position(newPosition: Vector);

  get velocity(): Vector;
}
