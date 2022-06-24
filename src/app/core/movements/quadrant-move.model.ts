import { IoC } from 'src/app/app.config';
import { MetaData } from '../adapter.model';
import { Command } from '../command.model';
import { UObject } from '../u-object.model';
import { Vector } from '../vector.model';

export class CheckCollision implements Command {
  constructor(private qmovable: QuadrantMovable, private object: UObject) {}
  execute(): void {}
}
export const checkCollision = (qmovable: QuadrantMovable, object: UObject): CheckCollision =>
  new CheckCollision(qmovable, object);

export class QuadrantMove implements Command {
  constructor(private qmovable: QuadrantMovable) {}

  execute(): void {
    const currentPosition = this.qmovable.getPosition();
    const currentQuadrant = this.qmovable.getQuadrant();

    if (!currentQuadrant.contain(currentPosition)) {
      const newQuadrant = this.qmovable.calculateQuadrant();
      this.qmovable.setQuadrant(newQuadrant);

      const objects = newQuadrant.getObjects();
      const newCollisions = objects.map((object: UObject) => checkCollision(this.qmovable, object));

      this.qmovable.setCollisions(newCollisions);
    }
  }
}

export interface Quadrant {
  contain(position: Vector): boolean;
  getObjects(): UObject[];
}

export interface QuadrantMovable {
  getPosition(): Vector;

  getQuadrant(): Quadrant;
  setQuadrant(newQuadrant: Quadrant): void;

  calculateQuadrant(): Quadrant;
  setCollisions(newCollisions: CheckCollision[]): void;
}

IoC.resolve<Command>(
  'IoC.Register',
  'QuadrantMovable.Metadata',
  () =>
    ({
      className: 'QuadrantMovable',
      methods: ['getPosition', 'getQuadrant', 'setQuadrant', 'calculateQuadrant', 'setCollisions'],
      methodDefinitions: {
        calculateQuadrant: () => ({} as Quadrant),
      },
    } as MetaData<QuadrantMovable>),
).execute();
