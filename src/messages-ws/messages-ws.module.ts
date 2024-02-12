import { Module } from '@nestjs/common';
import { MessagesWsService } from './messages-ws.service';
import { MessagesWsGateway } from './messages-ws.gateway';
import { UsersModule } from 'src/auth/users.module';

@Module({
  providers: [MessagesWsGateway, MessagesWsService],
  imports: [ UsersModule ]
})
export class MessagesWsModule {}
