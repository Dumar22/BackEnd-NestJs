import { Module } from '@nestjs/common';
import { MetersService } from './meters.service';
import { MetersController } from './meters.controller';
import { Meter } from './entities/meter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';

@Module({
  controllers: [MetersController],
  providers: [MetersService],
  imports: [
    TypeOrmModule.forFeature([Meter]),
    UsersModule,
    
  ],
  exports:[TypeOrmModule]
})
export class MetersModule {}
