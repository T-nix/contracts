import { Injectable } from "@nestjs/common";
import { AbstractGrpcClient } from "./abstract.grpc.client";
import { UserServiceClient } from "../../../gen/user";
import { ClientGrpc } from "@nestjs/microservices";
import { InjectGrpcClient } from "../decorators";

@Injectable()
export class UserServiceGrpc extends AbstractGrpcClient<UserServiceClient> {
    constructor(@InjectGrpcClient('user') client: ClientGrpc) {
        super(client, 'UserService');
    }
}