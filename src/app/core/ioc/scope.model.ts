import { IoCValues } from './ioc-container.model';

export class IoCScope {
  constructor(public name: string, public values: IoCValues, public parent?: IoCScope) {}
}
