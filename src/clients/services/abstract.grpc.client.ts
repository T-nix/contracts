import type { OnModuleInit, Type } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom, type Observable } from 'rxjs'
import { InjectGrpcClient } from '../decorators'

type UnwrapObservable<U> = U extends Observable<infer R> ? R : U

export abstract class AbstractGrpcClient<T extends Record<string, any>> {

    public constructor( 
        private readonly service: T,
        private readonly serviceName: string
    ) {}

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