import { SetMetadata } from '@nestjs/common';
import { ValidRols } from '../interfaces/valid-rols';

export const META_ROLS = 'rols'

export const RoleProtected = (...args: ValidRols[]) => {
    
    
    return SetMetadata( META_ROLS , args);

}
