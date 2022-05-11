import { Adapter } from './core/adapter.model';
import { Command } from './core/command.model';
import { IoCContainer } from './core/ioc/ioc-container.model';
import { UObject } from './core/u-object.model';

export const IoC = new IoCContainer();

IoC.resolve<Command>('IoC.Register', 'Adapter', (interfaceName: string, uObject: UObject) =>
  Adapter.generateAdapter(interfaceName, uObject),
).execute();
