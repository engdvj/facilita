import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';
import { isUserMode } from '../app-mode';

@Injectable()
export class CompanyModeGuard implements CanActivate {
  canActivate(): boolean {
    if (isUserMode()) {
      throw new ForbiddenException(
        'Operacao disponivel apenas no modo empresa.',
      );
    }
    return true;
  }
}
