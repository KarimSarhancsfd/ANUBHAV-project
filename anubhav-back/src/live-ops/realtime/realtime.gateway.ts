import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'live-ops',
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    
    client.emit('liveops:status', {
      connected: true,
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { channels: string[] }) {
    payload.channels.forEach((channel) => {
      client.join(channel);
    });
    
    return {
      status: 'success',
      subscribed: payload.channels,
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { channels: string[] }) {
    payload.channels.forEach((channel) => {
      client.leave(channel);
    });
    
    return {
      status: 'success',
      unsubscribed: payload.channels,
    };
  }

  broadcastEvent(event: string, payload: any) {
    this.server.emit(event, payload);
    this.logger.debug(`Broadcasted event: ${event}`);
  }

  broadcastToChannel(channel: string, event: string, payload: any) {
    this.server.to(channel).emit(event, payload);
    this.logger.debug(`Broadcasted to ${channel}: ${event}`);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getConnectedClients(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
