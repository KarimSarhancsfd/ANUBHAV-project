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

  /**
   * PERF: handleConnection — No heavy lifting here to keep event loop free.
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * PERF: handleDisconnect — O(1) cleanup.
   * Ensures no memory leaks when players drop frequently.
   */
  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (userId !== undefined) {
      this.onlineUsers.delete(userId);
      this.socketToUser.delete(client.id);
      
      // Cleanup: leave all rooms explicitly (though socket.io usually handles this)
      client.leave(`user:${userId}`);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Subscribe to personal room.
   * Consistent naming: `user:${id}`
   */
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `user:${data.userId}`;
    client.join(roomName);
    this.onlineUsers.set(data.userId, client.id);
    this.socketToUser.set(client.id, data.userId);
    this.logger.log(`User ${data.userId} joined room ${roomName}`);
  }

  /**
   * Private Chat — Optimized Room Broadcast.
   */
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
    const { receiverId } = data;
    // PERF: Emit only to the specific room.
    this.server.to(`user:${receiverId}`).emit('receivePrivateMessage', data);
  }

  /**
   * Join Group — Consistency Check.
   */
  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @MessageBody() data: { groupId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const groupRoom = `group:${data.groupId}`;
    client.join(groupRoom);
    this.logger.log(`User ${data.userId} joined group ${groupRoom}`);
  }

  /**
   * Group Chat — Multi-room broadcast.
   */
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
    const groupRoom = `group:${data.groupId}`;
    // PERF: Broadcast to group room.
    this.server.to(groupRoom).emit('receiveGroupMessage', data);
  }

  // ==================== ECONOMY REAL-TIME EVENTS ====================

  /**
   * Emit wallet update to user
   * PERF: High-frequency event. Avoid heavy logging.
   */
  emitWalletUpdate(userId: number, wallet: any) {
    if (!userId) return;
    this.server.to(`user:${userId}`).emit('wallet:updated', wallet);
  }

  /**
   * Emit purchase completion to user
   */
  emitPurchaseCompleted(userId: number, purchase: any) {
    if (!userId) return;
    this.server.to(`user:${userId}`).emit('purchase:completed', purchase);
    this.logger.log(`Purchase completed for user ${userId}`);
  }

  /**
   * Emit item granted to user
   */
  emitItemGranted(userId: number, item: any) {
    if (!userId) return;
    this.server.to(`user:${userId}`).emit('item:granted', item);
    this.logger.log(`Item granted to user ${userId}`);
  }

  /**
   * Emit transaction recorded to user
   */
  emitTransactionRecorded(userId: number, transaction: any) {
    if (!userId) return;
    this.server.to(`user:${userId}`).emit('transaction:recorded', transaction);
  }
}
