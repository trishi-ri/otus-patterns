import { IoC } from 'src/app/app.config';
import { MetaData } from '../adapter.model';
import { Command } from '../command.model';

export interface Order {
  getId(): number;
  getAction(): string;
  getActionParameters(): unknown[];
}

export const orderMetadataCommand = IoC.resolve<Command>(
  'IoC.Register',
  'Order.Metadata',
  () =>
    ({
      className: 'Order',
      methods: ['getId', 'getAction', 'getActionParameters'],
    } as MetaData<Order>),
);
