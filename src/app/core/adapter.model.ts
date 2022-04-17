import { IoC } from '../app.config';
import { KeyofAsTuple } from '../types';
import { Command } from './command.model';
import { UObject } from './u-object.model';

export type MetaData<T> = {
  className: string;
  methods: KeyofAsTuple<T>;
  methodDefinitions?: Partial<T>;
};

export class Adapter<T> {
  constructor(private uObject: UObject, private metadata: MetaData<T>) {
    const className = this.metadata.className;

    const getterRegExp = /^get(\w+)$/;
    const setterRegExp = /^set(\w+)$/;
    this.metadata.methods.forEach((method: string) => {
      const methodName = `${method}`;
      const isGetter = getterRegExp.test(methodName);
      const isSetter = setterRegExp.test(methodName);
      let value;
      if (isGetter || isSetter) {
        const match = methodName.match(isGetter ? getterRegExp : setterRegExp);
        const property = match ? match[1] : methodName;
        if (isGetter) {
          const getterKey = `${className}:${property}.get`;
          IoC.resolve<Command>('IoC.Register', getterKey, (obj: UObject) =>
            obj.getProperty(property),
          ).execute();
          value = (): T => IoC.resolve<T>(getterKey, this.uObject);
        } else {
          const setterKey = `${className}:${property}.set`;
          IoC.resolve<Command>('IoC.Register', setterKey, (obj: UObject, newValue: T) =>
            obj.setProperty(property, newValue),
          ).execute();
          value = (newValue: T): void => IoC.resolve<void>(setterKey, this.uObject, newValue);
        }
      } else if (metadata.methodDefinitions?.hasOwnProperty(methodName)) {
        const otherKey = `${className}:${methodName}`;
        IoC.resolve<Command>('IoC.Register', otherKey, () =>
          eval(`metadata.methodDefinitions.${methodName}()`),
        ).execute();
        value = (): void => IoC.resolve<void>(otherKey, this.uObject);
      }
      Object.defineProperty(this, methodName, { value });
    });
  }
}
