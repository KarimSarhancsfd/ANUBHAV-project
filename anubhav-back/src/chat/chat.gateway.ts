import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Store online users to manage private connections
  private onlineUsers: Map<number, string> = new Map(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log('connect', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('disconnect', client.id);
    // Remove user from online list
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        break;
      }
    }
  }

  // User will join their own room to make direct messaging possible
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user:${data.userId}`);
    this.onlineUsers.set(data.userId, client.id);
    console.log(`User ${data.userId} joined their personal room`);
  }

  // Private Chat
  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @MessageBody()
    data: {
      senderId: number;
      receiverId: number;
      message: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Private Message:', data);
    const { senderId, receiverId, message } = data;

    // Save to database here if needed

    // Emit to the receiver's personal room
    this.server.to(`user_${receiverId}`).emit('receivePrivateMessage', data);
  }

  // Join Group
  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @MessageBody() data: { groupId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`group_${data.groupId}`);
    console.log(`User ${data.userId} joined group ${data.groupId}`);
  }

  // Group Chat
  @SubscribeMessage('groupMessage')
  handleGroupMessage(
    @MessageBody()
    data: {
      senderId: number;
      groupId: number;
      message: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Group Message:', data);
    const { senderId, groupId, message } = data;

    // Save to database here if needed

    // Emit to all group members except sender
    this.server.to(`group_${groupId}`).emit('receiveGroupMessage', data);
  }

  // ==================== ECONOMY REAL-TIME EVENTS ====================

  /**
   * Emit wallet update to user
   */
  emitWalletUpdate(userId: number, wallet: any) {
    this.server.to(`user:${userId}`).emit('wallet:updated', wallet);
    console.log(`Emitted wallet update to user ${userId}`);
  }

  /**
   * Emit purchase completion to user
   */
  emitPurchaseCompleted(userId: number, purchase: any) {
    this.server.to(`user:${userId}`).emit('purchase:completed', purchase);
    console.log(`Emitted purchase completion to user ${userId}`);
  }

  /**
   * Emit item granted to user
   */
  emitItemGranted(userId: number, item: any) {
    this.server.to(`user:${userId}`).emit('item:granted', item);
    console.log(`Emitted item granted to user ${userId}`);
  }

  /**
   * Emit transaction recorded to user
   */
  emitTransactionRecorded(userId: number, transaction: any) {
    this.server.to(`user:${userId}`).emit('transaction:recorded', transaction);
    console.log(`Emitted transaction to user ${userId}`);
  }
}

