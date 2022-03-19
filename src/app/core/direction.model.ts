import { MathUtils } from '../utils/math.utils';

export class Direction {
  private _direction: number;
  private _directionNumbers: number;

  constructor(direction: number, directionNumbers: number) {
    if (!Number.isInteger(direction)) {
      throw new Error('направление должно быть целым числом');
    }
    if (!Number.isInteger(directionNumbers)) {
      throw new Error('количество направлений должно быть целым числом');
    }
    if (directionNumbers === 0) {
      throw new Error('количество направлений не должно быть 0');
    }

    this._direction = direction;
    this._directionNumbers = directionNumbers;
  }

  public get direction(): number {
    return this._direction;
  }

  public get directionNumbers(): number {
    return this._directionNumbers;
  }

  public next(angularVelocity: number): Direction {
    if (!Number.isInteger(angularVelocity)) {
      throw new Error('угловая скорость должна быть целым числом');
    }

    return new Direction(
      (this.direction + angularVelocity) % this.directionNumbers,
      this.directionNumbers,
    );
  }
}
