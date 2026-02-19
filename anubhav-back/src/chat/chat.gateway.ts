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
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // PERF: Dual-map for O(1) lookup in both directions.
  // onlineUsers: userId → socketId  (to find a user's socket)
  // socketToUser: socketId → userId (to find user on disconnect — was O(n) scan)
  private onlineUsers: Map<number, string> = new Map();
  private socketToUser: Map<string, number> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // PERF: O(1) reverse lookup — previously was O(n) linear scan over onlineUsers map.
    const userId = this.socketToUser.get(client.id);
    if (userId !== undefined) {
      this.onlineUsers.delete(userId);
      this.socketToUser.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // User will join their own room to make direct messaging possible
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user:${data.userId}`);
    this.onlineUsers.set(data.userId, client.id);
    this.socketToUser.set(client.id, data.userId);
    this.logger.log(`User ${data.userId} joined their personal room`);
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
    this.logger.debug(`Private Message from ${data.senderId} to ${data.receiverId}`);
    const { receiverId } = data;

    // PERF-FIX: Room name was `user_${receiverId}` (underscore) but everywhere
    // else (joinUserRoom, emitWalletUpdate) uses `user:${id}` (colon).
    // This was causing private messages to be silently lost. Fixed to be consistent.
    this.server.to(`user:${receiverId}`).emit('receivePrivateMessage', data);
  }

  // Join Group
  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @MessageBody() data: { groupId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`group_${data.groupId}`);
    this.logger.log(`User ${data.userId} joined group ${data.groupId}`);
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
    this.logger.debug(`Group message in group ${data.groupId} from user ${data.senderId}`);
    const { groupId } = data;

    // Emit to all group members except sender
    this.server.to(`group_${groupId}`).emit('receiveGroupMessage', data);
  }

  // ==================== ECONOMY REAL-TIME EVENTS ====================

  /**
   * Emit wallet update to user
   */
  emitWalletUpdate(userId: number, wallet: any) {
    this.server.to(`user:${userId}`).emit('wallet:updated', wallet);
    this.logger.debug(`Emitted wallet update to user ${userId}`);
  }

  /**
   * Emit purchase completion to user
   */
  emitPurchaseCompleted(userId: number, purchase: any) {
    this.server.to(`user:${userId}`).emit('purchase:completed', purchase);
    this.logger.debug(`Emitted purchase completion to user ${userId}`);
  }

  /**
   * Emit item granted to user
   */
  emitItemGranted(userId: number, item: any) {
    this.server.to(`user:${userId}`).emit('item:granted', item);
    this.logger.debug(`Emitted item granted to user ${userId}`);
  }

  /**
   * Emit transaction recorded to user
   */
  emitTransactionRecorded(userId: number, transaction: any) {
    this.server.to(`user:${userId}`).emit('transaction:recorded', transaction);
    this.logger.debug(`Emitted transaction to user ${userId}`);
  }
}
