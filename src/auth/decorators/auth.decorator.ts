import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRols } from '../interfaces/valid-rols';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UseRoleGuard } from '../guards/use-role/use-role.guard';

export function Auth(...roles: ValidRols[]) {
  return applyDecorators(
    RoleProtected( ...roles),    
    UseGuards(AuthGuard(), UseRoleGuard),   
  );
}