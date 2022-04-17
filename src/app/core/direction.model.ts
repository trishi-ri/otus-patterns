export class Direction {
  constructor(private _direction: number, private _directionNumbers: number) {
    if (!Number.isInteger(this._direction)) {
      throw new Error('направление должно быть целым числом');
    }
    if (!Number.isInteger(this.directionNumbers)) {
      throw new Error('количество направлений должно быть целым числом');
    }
    if (this.directionNumbers === 0) {
      throw new Error('количество направлений не должно быть 0');
    }
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
