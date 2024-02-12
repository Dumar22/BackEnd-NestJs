import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';


interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}
@Injectable()
export class MessagesWsService {


    private connectedClients: ConnectedClients = {};

    constructor (
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}


   async registerClients( client: Socket, userId: string ){

    const user = await this.userRepository.findOneBy({id: userId});
    if(!user) throw new Error(`User ${userId} not found`);
    if(!user.isActive) throw new Error(`User ${userId} not active`);
 this.connectedClients[client.id] = {
    socket: client,
    user: user,
 };
    }

    revomeClient( clientId: string){
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[]{
return Object.keys(this.connectedClients);
    }

    getUserFullName( socketId: string){
        return this.connectedClients[socketId].user.fullName
    }
}
