import { IoC } from 'src/app/app.config';
import { MetaData } from '../adapter.model';
import { Command } from '../command.model';
import { Direction } from '../direction.model';

export class RotateCommand implements Command {
  constructor(private rotatable: Rotatable) {}

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

IoC.resolve<Command>(
  'IoC.Register',
  'Rotatable.Metadata',
  () =>
    ({
      className: 'Rotatable',
      methods: ['getDirection', 'setDirection', 'getAngularVelocity'],
    } as MetaData<Rotatable>),
).execute();
