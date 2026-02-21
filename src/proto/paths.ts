import { join } from "path";

export const PROTO_PATHS = {
    AUTH: join(__dirname, '../../proto/auth.proto'),
    PERMISSION: join(__dirname, '../../proto/permission.proto'),
    USER: join(__dirname, '../../proto/user.proto')
} as const