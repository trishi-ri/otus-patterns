import { IoCValues } from './ico-container.model';

export class IoCScope {
  constructor(public name: string, public values: IoCValues, public parent?: IoCScope) {}
}
