export class Vector {
  constructor(public x: number, public y: number) {}

  public static plus(...vectors: Vector[]): Vector {
    const newVector = (vectors || []).reduce((prev: Vector, curr: Vector) => {
      return new Vector(prev.x + curr.x, prev.y + curr.y);
    }, new Vector(0, 0));

    if (newVector.x > Number.MAX_SAFE_INTEGER || newVector.y > Number.MAX_SAFE_INTEGER) {
      throw new Error('сумма векторов больше максимума');
    }
    if (newVector.x < Number.MIN_SAFE_INTEGER || newVector.y < Number.MIN_SAFE_INTEGER) {
      throw new Error('сумма векторов меньше минимума');
    }

    return newVector;
  }
}
