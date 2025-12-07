import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';

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
  // Cache for user status checks (TTL: 5 minutes) to reduce DB load
  private userStatusCache: Map<
    string,
    { isActive: boolean; timestamp: number }
  > = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      this.logger.log(`Client connected: ${client.id}`);

      // 1) Preferred: Socket.io auth payload (frontend should send auth: { token })
      let token = client.handshake.auth.token;
      if (token) {
        this.logger.debug('Token from handshake.auth.token');
      }

      // 2) Fallback: Authorization header (Bearer ...)
      if (!token && client.handshake.headers.authorization) {
        token = client.handshake.headers.authorization;
        this.logger.debug('Token from handshake.headers.authorization');
      }

      // 3) Final fallback: accessToken cookie
      if (!token && client.handshake.headers.cookie) {
        const cookie = client.handshake.headers.cookie;
        token = cookie
          .split('; ')
          .find((c) => c.startsWith('accessToken='))
          ?.split('=')[1];
        if (token) {
          this.logger.debug('Token from handshake.headers.cookie (accessToken)');
        }
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
        this.logger.debug(`User data from token: userId=${user?.sub}`);

        if (!user?.sub) {
          throw new Error('Invalid user data in token');
        }

        // Verify user is active in database (lightweight check with caching)
        const isUserActive = await this.verifyUserActive(user.sub);
        if (!isUserActive) {
          throw new Error('User account is inactive or deleted');
        }

        this.userSockets.set(user.sub, client.id);
        client.join(`user_${user.sub}`);
        this.logger.log(`User ${user.sub} connected with socket ${client.id}`);
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
    this.logger.log(`Sent notification to user ${userId}`, { notification });
  }

  private async validateToken(token: string): Promise<any> {
    try {
      this.logger.debug('Validating token');
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        this.logger.error('JWT_SECRET is not configured');
        return null;
      }
      const payload = this.jwtService.verify(token, {
        secret: secret,
      });
      this.logger.debug(
        `Token validated successfully for userId=${
          payload?.sub || payload?.userId
        }`
      );

      return payload;
    } catch (error: any) {
      this.logger.error('Invalid token:', error.message);
      return null;
    }
  }

  /**
   * Verify user is active in database (with smart caching for resilience)
   * This prevents deleted/deactivated users from connecting even with valid tokens
   *
   * Security-first approach:
   * - Fresh cache (< 5 min): Use immediately (no DB call)
   * - Stale cache (< 10 min): Use during brief outages (resilience)
   * - No cache/service down: Block connection (security)
   */
  private async verifyUserActive(userId: string): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.userStatusCache.get(userId);
      const now = Date.now();

      // Use cached value if fresh (within TTL)
      if (cached && now - cached.timestamp < this.CACHE_TTL) {
        return cached.isActive;
      }

      // If cache is stale but exists, we have recent data - use it for resilience
      // This provides resilience during brief outages while maintaining security
      const staleCacheThreshold = this.CACHE_TTL * 2; // 10 minutes
      if (cached && now - cached.timestamp < staleCacheThreshold) {
        this.logger.warn(
          `Using stale cache for user ${userId} (age: ${Math.round(
            (now - cached.timestamp) / 1000
          )}s). User service may be unavailable.`
        );
        return cached.isActive;
      }

      // No cache or very stale - must verify with user service
      // FAIL CLOSED: If we can't verify and have no cache, block connection
      const user = await firstValueFrom(
        this.userService.send('UserService.Users.findOne', { id: userId }).pipe(
          timeout(3000), // 3 second timeout for user service call
          catchError((error) => {
            this.logger.error(
              `Failed to verify user ${userId} status: ${error.message}`
            );
            // FAIL CLOSED: If we can't verify and have no cache, block connection
            // Security is more important than availability for medical systems
            throw new Error(
              `Cannot verify user status: User service unavailable`
            );
          })
        )
      );

      if (!user) {
      if (!user) {
        this.logger.warn(`User ${userId} not found in database`);
        return false;
      }

      const isActive = user.isActive !== false && !user.isDeleted;
      
      // Cache the result
      this.userStatusCache.set(userId, {
        isActive,
        timestamp: now,
      });

      // Clean old cache entries periodically (simple cleanup)
      if (this.userStatusCache.size > 1000) {
        for (const [key, value] of this.userStatusCache.entries()) {
          if (now - value.timestamp > staleCacheThreshold) {
            this.userStatusCache.delete(key);
          }
        }
      }

      return isActive;
    } catch (error: any) {
      this.logger.error(`Error verifying user ${userId}:`, error.message);
      // FAIL CLOSED: Block connection if we can't verify user status
      throw new Error(`User verification failed: ${error.message}`);
    }
  }
}
