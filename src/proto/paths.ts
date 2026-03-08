import { join } from "path";
import { AccountServiceClient, UserServiceClient } from "../../gen/user";
import { AuthServiceClient } from "../../gen/auth";

export type GrpcServices = {
  UserService: UserServiceClient,
  AuthService: AuthServiceClient,
  AccountService: AccountServiceClient
  CSRService: any,
  PermissionService: any,
  RoleService: any,
  DelegationService: any,
  SubjectService: any,
  PolicyConditionService: any,
}


export type ServiceNames = keyof GrpcServices;

export interface GrpcClientConfig {
    file: string
    host: string
    port: number
    version: string
    serviceName: ServiceNames[]
}

export const PROTO_PATHS: Record<string, GrpcClientConfig>= {
    auth: {
        file: join(__dirname, '../../proto/auth.proto'),
        host: 'localhost',
        port: 50001,
        version: 'auth.v1',
        serviceName: ['AuthService'],
    },
    
    permission: {
        file: join(__dirname, '../../proto/permission.proto'),
        host: 'localhost',
        port: 50002,
        version: 'permission.v1',
        serviceName: ['PermissionService'],
    },

    user: {
        file: join(__dirname, '../../proto/user.proto'),
        host: 'localhost',
        port: 50003,
        version: 'user.v1',
        serviceName: ['UserService', 'AccountService'],
    },

    csr: {
        file: join(__dirname, '../../proto/csr.proto'),
        host: 'localhost',
        port: 50004,
        version: 'csr.v1',
        serviceName: ['CSRService', 'RoleService', 'DelegationService', 'SubjectService', 'PermissionService', 'PolicyConditionService'],
    },
} as const

export type ProtoKey = keyof typeof PROTO_PATHS;
