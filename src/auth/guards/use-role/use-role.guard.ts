import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate,
   ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLS } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UseRoleGuard implements CanActivate {

constructor (
  private readonly reflector: Reflector
){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get( META_ROLS , context.getHandler())
 
    //console.log(validRoles);  
   
    if(!validRoles) return true;
    if(validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();        
    const user = req.user as User;

   // console.log(user);
    

        if (!user)
         throw new BadRequestException('User not found');

        //console.log({userRoles: user.rol});
         

         for (const role of user.rol) {
          if( validRoles.includes (role))
            return true
         }

         throw new ForbiddenException(
          `User ${user.fullName} need a valid rol: ${validRoles}`
         )

    
  }
}
