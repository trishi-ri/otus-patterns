import { IoC } from '../app.config';
import { KeyofAsTuple } from '../types';
import { Command } from './command.model';
import { Movable } from './movements/move.model';
import { UObject } from './u-object.model';

export type MetaData<T> = {
  className: string;
  methods: KeyofAsTuple<T>;
  methodDefinitions?: Partial<T>;
};

export class AdapterUtils {
  private static readonly getterRegExp = /^get(\w+)$/;
  private static readonly setterRegExp = /^set(\w+)$/;

  public static getMethodDefenition<T>(
    methodName: string,
    className: string,
    methodDefinitions?: Partial<T>,
  ): string {
    const isGetter = AdapterUtils.getterRegExp.test(methodName);
    const isSetter = AdapterUtils.setterRegExp.test(methodName);
    if (isGetter || isSetter) {
      const match = methodName.match(
        isGetter ? AdapterUtils.getterRegExp : AdapterUtils.setterRegExp,
      );
      const property = match ? match[1] : methodName;
      if (isGetter) {
        const getterKey = `${className}:${property}.get`;
        IoC.resolve<Command>('IoC.Register', getterKey, (obj: UObject) =>
          obj.getProperty(property),
        ).execute();
        return `${methodName}() { return this.IoC.resolve("${getterKey}", this.uObject)}`;
      } else {
        const setterKey = `${className}:${property}.set`;
        IoC.resolve<Command>('IoC.Register', setterKey, (obj: UObject, newValue: unknown) =>
          obj.setProperty(property, newValue),
        ).execute();
        return `${methodName}(newValue){return this.IoC.resolve("${setterKey}", this.uObject, newValue)}`;
      }
    } else if (methodDefinitions?.hasOwnProperty(methodName)) {
      const otherKey = `${className}:${methodName}`;
      IoC.resolve<Command>('IoC.Register', otherKey, () =>
        eval(`methodDefinitions.${methodName}()`),
      ).execute();
      return `${methodName}(){return this.IoC.resolve("${otherKey}", this.uObject)}`;
    }
    return '';
  }

  public static getClassDefenition<T>(metadata: MetaData<T>): string {
    return `(class ${metadata.className}Adapter {
      uObject; IoC;
      constructor(uObject, IoC) {this.uObject = uObject;this.IoC = IoC;}
      ${(metadata.methods as string[])
        .map((name) => {
          return AdapterUtils.getMethodDefenition<T>(
            name,
            metadata.className,
            metadata.methodDefinitions,
          );
        })
        .join('\n')}
      })`;
  }
}
