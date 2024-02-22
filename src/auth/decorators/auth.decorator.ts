import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidRols } from '../interfaces/valid-rols';
import { RoleProtected } from './role-protected.decorator';
import { UseRoleGuard } from '../guards/use-role/use-role.guard';

export function Auth(...roles: ValidRols[]) {
  return applyDecorators(
    RoleProtected( ...roles),    
    UseGuards(AuthGuard(), UseRoleGuard),   
  );
}