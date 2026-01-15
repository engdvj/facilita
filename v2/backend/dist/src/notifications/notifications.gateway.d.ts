import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    private usersService;
    server: Server;
    private userSockets;
    constructor(jwtService: JwtService, configService: ConfigService, usersService: UsersService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    emitToUser(userId: string, event: string, data: any): void;
    emitToUsers(userIds: string[], event: string, data: any): void;
    isUserOnline(userId: string): boolean;
}
