import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload-interface';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){

    constructor(
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,

        configService : ConfigService,
    ){
        super({
                secretOrKey: configService.get('SECRET_PRIVATE_KEY'),
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate ( payload: JwtPayload ): Promise<User>{
      
        const { id } = payload;

        const userL = await this.userRepository.findOneBy({id});

        if (!id) 
            throw new UnauthorizedException('Token no es válido')

        if (userL === null) 
            throw new UnauthorizedException('Usuario no encontrado, contacte al administrador')
        

        if (!userL.isActive) 
            throw new UnauthorizedException('Usuario no activo, contacte al administrador')



        
        return userL;
    }
}