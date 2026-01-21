import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { isUserMode } from '../app-mode';

@Injectable()
export class UserModeSuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!isUserMode()) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const role = request?.user?.role as UserRole | undefined;
    if (role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException(
        'Acesso restrito ao superusuario no modo usuario.',
      );
    }
    return true;
  }
}
