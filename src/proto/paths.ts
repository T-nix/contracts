import { join } from "path";
import { AccountServiceClient, UserServiceClient } from "../../gen/user";
import { AuthServiceClient } from "../../gen/auth";
import { PermissionServiceClient, PolicyServiceClient, RoleServiceClient, RuleServiceClient } from "../../gen/csr";

export type GrpcServices = {
  UserService: UserServiceClient,
  AuthService: AuthServiceClient,
  AccountService: AccountServiceClient
  PermissionService: PermissionServiceClient,
  RoleService: RoleServiceClient,
  RuleService: RuleServiceClient,
  PolicyService: PolicyServiceClient
  /*
  CSRService: CSRServiceClient,
  DelegationService: DelegationServiceClient,
  SubjectService: SubjectServiceClient,
  */
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
        serviceName: ['PermissionService', 'RoleService', 'PolicyService', 'RuleService'],
    },
} as const

export type ProtoKey = keyof typeof PROTO_PATHS;
