export class MathUtils {
  public static solveQuadraticEquation(a: number, b: number, c: number): number[] {
    if (isNaN(a)) {
      throw new Error('коэффициент "a" должен быть числом');
    }
    if (isNaN(b)) {
      throw new Error('коэффициент "b" должен быть числом');
    }
    if (isNaN(c)) {
      throw new Error('коэффициент "c" должен быть числом');
    }

    if (!Number.isFinite(a)) {
      throw new Error('коэффициент "a" должен быть конечным числом');
    }
    if (!Number.isFinite(b)) {
      throw new Error('коэффициент "b" должен быть конечным числом');
    }
    if (!Number.isFinite(c)) {
      throw new Error('коэффициент "c" должен быть конечным числом');
    }

    if (MathUtils.isBoundary(a)) {
      throw new Error('коэффициент "a" не должен быть граничным числом');
    }
    if (MathUtils.isBoundary(b)) {
      throw new Error('коэффициент "b" не должен быть граничным числом');
    }
    if (MathUtils.isBoundary(c)) {
      throw new Error('коэффициент "c" не должен быть граничным числом');
    }

    if (MathUtils.equal(a, 0)) {
      throw new Error('коэффициент "a" не может быть равен 0');
    }

    const d = b * b - 4 * a * c;

    if (MathUtils.equal(d, 0)) {
      const x = -b / (2 * a);
      return [x];
    }

    if (d > 0) {
      const x1 = (-b + Math.sqrt(d)) / (2 * a);
      const x2 = (-b - Math.sqrt(d)) / (2 * a);
      return [x1, x2];
    }

    return [];
  }

  public static equal(a: number, b: number): boolean {
    return Math.abs(a - b) < Number.EPSILON;
  }

  public static isBoundary(value: number): boolean {
    return [
      Number.MAX_VALUE,
      Number.MIN_VALUE,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
    ].includes(value);
  }

  public static get randomId(): number {
    return Number(`${Math.random()}`.split('.')[1]);
  }
}
