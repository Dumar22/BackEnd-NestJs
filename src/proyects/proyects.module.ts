import { Module } from '@nestjs/common';
import { ProyectsService } from './proyects.service';
import { ProyectsController } from './proyects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyect } from './entities/proyect.entity';
import { UsersModule } from 'src/auth/users.module';

@Module({
  controllers: [ProyectsController],
  providers: [ProyectsService],
  imports: [
    TypeOrmModule.forFeature([Proyect]),
    UsersModule,
    
    
  ],
  exports:[TypeOrmModule]
})
export class ProyectsModule {}
