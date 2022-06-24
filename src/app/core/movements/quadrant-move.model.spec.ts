import { anything, capture, instance, mock, verify, when } from 'ts-mockito';
import { UObject } from '../u-object.model';
import { Vector } from '../vector.model';
import { checkCollision, Quadrant, QuadrantMovable, QuadrantMove } from './quadrant-move.model';

describe('QuadrantMove', () => {
  let mockedQuadrantMovable: QuadrantMovable;
  let quadrantMovable: QuadrantMovable;

  beforeEach(() => {
    mockedQuadrantMovable = mock<QuadrantMovable>();
    quadrantMovable = instance(mockedQuadrantMovable);
  });

  describe('execute', () => {
    it('объект в прежней окресности => новый квадрант не будет установлен', () => {
      when(mockedQuadrantMovable.getPosition()).thenReturn(new Vector(0, 0));
      when(mockedQuadrantMovable.getQuadrant()).thenReturn({
        contain: (_: Vector) => true,
      } as Quadrant);

      const quadrantMove = new QuadrantMove(quadrantMovable);
      quadrantMove.execute();

      verify(mockedQuadrantMovable.setQuadrant(anything())).never();
      expect().nothing();
    });

    it('объект сменил окресность => будет установлен новый квадрант и обновлены коллизии', () => {
      when(mockedQuadrantMovable.getPosition()).thenReturn(new Vector(0, 1));
      when(mockedQuadrantMovable.getQuadrant()).thenReturn({
        contain: (_: Vector) => false,
      } as Quadrant);
      const objectInQuadrant = {} as UObject;
      const calculatedQuadrant = {
        getObjects: () => [objectInQuadrant],
      } as Quadrant;
      when(mockedQuadrantMovable.calculateQuadrant()).thenReturn(calculatedQuadrant);

      const quadrantMove = new QuadrantMove(quadrantMovable);
      quadrantMove.execute();

      verify(mockedQuadrantMovable.setQuadrant(anything())).once();
      const [newQuadrant] = capture(mockedQuadrantMovable.setQuadrant).last();
      expect(newQuadrant).toEqual(calculatedQuadrant);
      verify(mockedQuadrantMovable.setCollisions(anything())).once();
      const [collision] = capture(mockedQuadrantMovable.setCollisions).last();
      expect(collision).toEqual([checkCollision(quadrantMovable, objectInQuadrant)]);
    });
  });
});
