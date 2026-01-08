import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    login(body: LoginDto, res: Response): Promise<{
        user: {
            [x: string]: any;
        };
        accessToken: string;
        tokenType: string;
    }>;
    refresh(body: RefreshDto, req: Request, res: Response): Promise<{
        user: {
            [x: string]: any;
        };
        accessToken: string;
        tokenType: string;
    }>;
    logout(body: RefreshDto, req: Request, res: Response): Promise<{
        success: boolean;
    }>;
    me(user: Record<string, any>): Record<string, any>;
    private setRefreshCookie;
    private clearRefreshCookie;
}
