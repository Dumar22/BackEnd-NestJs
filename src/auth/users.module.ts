import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.startegy';
import { WarehousesModule } from 'src/warehouses/warehouses.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  imports: [
    
    ConfigModule,

    TypeOrmModule.forFeature([User]),

  PassportModule.register({ defaultStrategy: 'jwt'}),
   
  JwtModule.registerAsync({
    imports:[ConfigModule],
    inject: [ConfigService],
    useFactory:(configService: ConfigService) =>{
      //console.log('JWT Secret',process.env.SECRET_PRIVATE_KEY);
      //console.log('JWT Secret',configService.get('SECRET_PRIVATE_KEY'));    
      return {
      secret: configService.get('SECRET_PRIVATE_KEY'),
      signOptions:{
      expiresIn:'10h'
      }
    }
  } 
  }),

  // JwtModule.register({
  //   secret: process.env.SECRET_PRIVATE_KEY,
  //   signOptions:{
  //     expiresIn:'10h'
  //   }
  // })
  WarehousesModule,
  
],
  exports: [ TypeOrmModule, JwtStrategy, PassportModule, JwtModule, ]
})
export class UsersModule {}
