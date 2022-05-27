import { Adapter } from '../adapter.model';
import { Command } from '../command.model';
import { UObject } from '../u-object.model';
import { IoC } from './ioc.model';
import { IoCScope } from './scope.model';

type IoCKey = 'IoC.Register' | 'Scope.New' | 'Scope.Current' | string;
type IoCValue = (...args: unknown[]) => unknown;
export type IoCValues = Record<IoCKey, IoCValue>;

export class IoCContainer implements IoC {
  private scopes: Record<string, IoCScope>;
  private currentScope: IoCScope;

  constructor() {
    this.scopes = {
      default: this.defaultScope,
    };
    this.currentScope = this.scopes['default'];
  }

  resolve<T>(key: IoCKey, ...args: unknown[]): T {
    try {
      return this.getValue(key)(...args) as T;
    } catch (e) {
      throw e;
    }
  }

  public get keys(): string[] {
    return Object.keys(this.values);
  }

  public get scoupesNames(): string[] {
    return Object.keys(this.scopes);
  }

  public get scopeName(): string {
    return this.currentScope.name;
  }

  private getValue(key: IoCKey, scope?: IoCScope): IoCValue {
    const scopeForSearch = scope ?? this.currentScope;
    const value = scopeForSearch.values[key];

    if (value) {
      return value;
    }

    if (scopeForSearch.parent) {
      return this.getValue(key, scopeForSearch.parent);
    }

    throw new Error(`не удалось найти значение по ключу "${key}"`);
  }

  private get values(): IoCValues {
    return this.currentScope.values;
  }

  private get defaultScope(): IoCScope {
    return new IoCScope('default', {
      'IoC.Register': (key, fn) =>
        ({
          execute: () => (this.values[key as IoCKey] = fn as IoCValue),
        } as Command),
      'Scope.New': (name) =>
        ({
          execute: () =>
            (this.scopes[name as string] = new IoCScope(name as string, {}, this.currentScope)),
        } as Command),
      'Scope.Current': (name) =>
        ({
          execute: () => {
            const scope = this.scopes[name as string];
            if (!scope) {
              throw new Error(`не удалось найти скоуп по имени "${name}"`);
            }
            this.currentScope = scope;
          },
        } as Command),
      Adapter: (interfaceName, uObject) =>
        Adapter.generateAdapter(interfaceName as string, uObject as UObject),
    });
  }
}
