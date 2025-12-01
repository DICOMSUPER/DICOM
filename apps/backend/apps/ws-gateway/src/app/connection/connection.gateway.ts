import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
    transports: ['websocket', 'polling'],
  },
})
export class ConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('ConnectionGateway');
  private userSockets: Map<string, string> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      this.logger.log(`Client connected: ${client.id}`);
      console.log(`Client connected: ${client.id}`);

      let token =
        client.handshake.auth.token || client.handshake.headers.authorization;
      console.log(`Token from handshake: ${token}`);

      if (!token && client.handshake.headers.cookie) {
        const cookie = client.handshake.headers.cookie;
        token = cookie
          .split('; ')
          .find((c) => c.startsWith('accessToken='))
          ?.split('=')[1];
      }

      if (!token) {
        this.logger.error('No authorization header provided');
        client.emit('error', { message: 'Unauthorized: No token provided' });
        client.disconnect();
        return;
      }

      try {
        const cleanToken = token.startsWith('Bearer ')
          ? token.replace('Bearer ', '')
          : token;

        const user = await this.validateToken(cleanToken);
        console.log(`User data from token: user websocket`, user.sub);

        if (!user?.sub) {
          throw new Error('Invalid user data in token');
        }
        this.userSockets.set(user.sub, client.id);
        client.join(`user_${user.sub}`);
        this.logger.log(`User ${user.sub} connected with socket ${client.id}`);
        console.log(`User ${user.sub} connected with socket ${client.id}`);
      } catch (error: any) {
        this.logger.error(`Connection error: ${error.message}`);
        client.emit('error', { message: `Unauthorized: ${error.message}` });
        client.disconnect();
      }
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
    this.logger.log(`Sent notification to user ${userId}:`, notification);
    console.log(`Sent notification to user socket ${userId}:`, notification);
  }

  private async validateToken(token: string): Promise<any> {
    try {
      console.log(`Validating token: ${token}`);
      const secret = process.env.JWT_SECRET;
      console.log('JWT secret:', secret);
      const payload = this.jwtService.verify(token, {
        secret: secret,
      });
      console.log(`JWT payload:`, payload);

      return payload;
    } catch (error: any) {
      this.logger.error('Invalid token:', error.message);
      return null;
    }
  }
}
