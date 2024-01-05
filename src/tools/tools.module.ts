import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { Tool } from './entities/tool.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';

@Module({
  controllers: [ToolsController],
  providers: [ToolsService],
  imports: [
    TypeOrmModule.forFeature([Tool]),
    UsersModule,
    
  ],
  exports:[TypeOrmModule]
})
export class ToolsModule {}
