import { Direction } from '../core/direction.model';

export class Rotate {
  private rotatable: Rotatable;

  constructor(rotatable: Rotatable) {
    this.rotatable = rotatable;
  }

  public execute(): void {
    try {
      this.rotatable.direction = this.rotatable.direction.next(this.rotatable.angularVelocity);
    } catch (e) {
      throw e;
    }
  }
}

export interface Rotatable {
  get direction(): Direction;
  set direction(newDirection: Direction);

  get angularVelocity(): number;
}
