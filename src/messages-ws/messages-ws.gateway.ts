import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NemwMessageDto } from './dto/message.dto';
import { MessagesWsService } from './messages-ws.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload-interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

@WebSocketServer() wss: Socket;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
    ) {}


 async handleConnection(client: Socket) {
const token = client.handshake.headers.authentication as string;

let payload: JwtPayload

try {
  payload = this.jwtService.verify( token );
  await this.messagesWsService.registerClients( client, payload.id )
  
} catch (error) {
  client.disconnect();
  return;
}


    this.wss.emit('clients-update', this.messagesWsService.getConnectedClients() )
  }


  handleDisconnect(client: Socket ) {
    this.messagesWsService.revomeClient( client.id);

    this.wss.emit('clients-update', this.messagesWsService.getConnectedClients() )
  }

 @SubscribeMessage('message')
 handleMessageFromClient(client: Socket, payload: NemwMessageDto){
 
//   client.emit('message-server', {
//     fullName:'hola',
//     message: payload.message || 'no-message'
//   })
//  }
//   client.broadcast.emit('message-server', {
//     fullName:'hola',
//     message: payload.message || 'no-message'
//   })
//  }
  this.wss.emit('message-server', {
    fullName:this.messagesWsService.getUserFullName(client.id),
    message: payload.message || 'no-message'
  })
 }

}
