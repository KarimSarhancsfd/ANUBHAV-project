/**
 * @file chat.gateway.ts
 * @description WebSocket gateway for real-time chat functionality, handling private messages, group messages, and real-time economy events.
 */
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

/**
 * WebSocket gateway for real-time chat and economy events.
 * Handles client connections, private messaging, group messaging, and wallet/purchase notifications.
 * Uses dual-map structure for O(1) user-socket lookups.
 */
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
   * Handles a new client connection.
   * @param client - The connected Socket client
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handles client disconnection and cleans up user mappings.
   * @param client - The disconnected Socket client
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
   * Subscribes a user to their personal room for private messaging.
   * @param data - Object containing the user ID
   * @param data.userId - The ID of the user joining the room
   * @param client - The Socket client joining the room
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
   * Sends a private message from one user to another.
   * @param data - Object containing sender, receiver, and message
   * @param data.senderId - The ID of the message sender
   * @param data.receiverId - The ID of the message receiver
   * @param data.message - The message content
   * @param client - The Socket client sending the message
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
   * Adds a user to a group chat room.
   * @param data - Object containing group ID and user ID
   * @param data.groupId - The ID of the group to join
   * @param data.userId - The ID of the user joining the group
   * @param client - The Socket client joining the group
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
   * Broadcasts a message to all members of a group chat.
   * @param data - Object containing sender, group, and message
   * @param data.senderId - The ID of the message sender
   * @param data.groupId - The ID of the target group
   * @param data.message - The message content
   * @param client - The Socket client sending the message
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
   * Emits a wallet update event to a specific user.
   * @param userId - The ID of the user to receive the wallet update
   * @param wallet - The updated wallet data
   */
  emitWalletUpdate(userId: number, wallet: any) {
    if (!userId) return;
    this.server.to(`user:${userId}`).emit('wallet:updated', wallet);
  }

  /**
   * Emits a purchase completion event to a specific user.
   * @param userId - The ID of the user who completed the purchase
   * @param purchase - The purchase data
   */
  emitPurchaseCompleted(userId: number, purchase: any) {
    if (!userId) return;
    this.server.to(`user:${userId}`).emit('purchase:completed', purchase);
    this.logger.log(`Purchase completed for user ${userId}`);
  }

  /**
   * Emits an item granted event to a specific user.
   * @param userId - The ID of the user receiving the item
   * @param item - The item data
   */
  emitItemGranted(userId: number, item: any) {
    if (!userId) return;
    this.server.to(`user:${userId}`).emit('item:granted', item);
    this.logger.log(`Item granted to user ${userId}`);
  }

  /**
   * Emits a transaction recorded event to a specific user.
   * @param userId - The ID of the user who has the transaction
   * @param transaction - The transaction data
   */
  emitTransactionRecorded(userId: number, transaction: any) {
    if (!userId) return;
    this.server.to(`user:${userId}`).emit('transaction:recorded', transaction);
  }
}
