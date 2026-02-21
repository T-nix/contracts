import type { OnModuleInit, Type } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom, type Observable } from 'rxjs'
import { InjectGrpcClient } from './decorators'

type UnwrapObservable<U> = U extends Observable<infer R> ? R : U

export abstract class AbstractGrpcClient1<T extends Record<string, any>> implements OnModuleInit {
    protected service!: T
 
    public constructor( 
        private readonly client: ClientGrpc,
        private readonly serviceName: string
    ) {}

    public onModuleInit() {
        this.service = this.client.getService<T>(this.serviceName)
    }

    public async call<K extends keyof T>(
        method: K, 
        payload: Parameters<T[K]>[0]
    ): Promise<UnwrapObservable<ReturnType<T[K]>>> {
        try {
            const observable = this.service[method](payload)
            const result = await lastValueFrom(observable) 

            return result as UnwrapObservable<ReturnType<T[K]>>
        } catch (error) {
            throw error
        }
    }
}

/*
export abstract class AbstractGrpcClient<T>
  implements OnModuleInit
{
  protected service!: T;

  protected constructor(
    protected readonly client: ClientGrpc,
    protected readonly serviceName: string,
  ) {}

  onModuleInit() {
    this.service = this.client.getService<T>(
      this.serviceName,
    );
  }
}

export interface GetConfigRequest {
  env: string;
}

export interface ConfigServiceClient {
  getConfig(req: GetConfigRequest): Promise<any>;
}

export class ConfigClient extends AbstractGrpcClient<ConfigServiceClient> {
  getConfig(req: GetConfigRequest) {
    return this.service.getConfig(req);
  }
}

export const CLIENT_WRAPPERS = {
  CONFIG: {
    wrapper: ConfigClient,
    grpcServiceName: 'ConfigService',
    package: 'config',
  },
};
*/