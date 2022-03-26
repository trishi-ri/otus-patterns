import { Direction } from '../core/direction.model';

export class Rotate {
  private rotatable: Rotatable;

  constructor(rotatable: Rotatable) {
    this.rotatable = rotatable;
  }

  public execute(): void {
    try {
      this.rotatable.setDirection(
        this.rotatable.getDirection().next(this.rotatable.getAngularVelocity()),
      );
    } catch (e) {
      throw e;
    }
  }
}

export interface Rotatable {
  getDirection(): Direction;
  setDirection(newDirection: Direction): void;

  getAngularVelocity(): number;
}
