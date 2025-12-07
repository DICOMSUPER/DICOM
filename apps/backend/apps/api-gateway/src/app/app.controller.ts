import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { Roles } from '@backend/shared-enums';
import { Public } from '@backend/shared-decorators';
import { Role } from '@backend/shared-decorators';

@ApiTags('System Health & Status')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
    @Inject('PATIENT_SERVICE')
    private readonly patientServiceClient: ClientProxy,
    @Inject('IMAGING_SERVICE')
    private readonly imagingServiceClient: ClientProxy,
    @Inject('SYSTEM_SERVICE')
    private readonly systemServiceClient: ClientProxy,
    @Inject('WEBSOCKET_SERVICE')
    private readonly websocketServiceClient: ClientProxy
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get API Gateway information' })
  @ApiResponse({
    status: 200,
    description: 'API Gateway info retrieved successfully',
  })
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Check health status of all microservices' })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
  })
  async checkAllServicesHealth() {
    // Run all health checks in parallel to ensure all services are checked
    const [
      userService,
      patientService,
      imagingService,
      systemService,
      websocketGateway,
    ] = await Promise.allSettled([
      this.checkServiceHealth(
        this.userServiceClient,
        'UserService.HealthCheck'
      ),
      this.checkServiceHealth(
        this.patientServiceClient,
        'PatientService.HealthCheck'
      ),
      this.checkServiceHealth(
        this.imagingServiceClient,
        'ImagingService.HealthCheck'
      ),
      this.checkServiceHealth(
        this.systemServiceClient,
        'SystemService.HealthCheck'
      ),
      this.checkServiceHealth(
        this.websocketServiceClient,
        'WebSocketGateway.HealthCheck'
      ),
    ]);

    const results = {
      apiGateway: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      services: {
        userService:
          userService.status === 'fulfilled'
            ? userService.value
            : {
                status: 'unhealthy',
                error: userService.reason?.message || 'Health check failed',
              },
        patientService:
          patientService.status === 'fulfilled'
            ? patientService.value
            : {
                status: 'unhealthy',
                error: patientService.reason?.message || 'Health check failed',
              },
        imagingService:
          imagingService.status === 'fulfilled'
            ? imagingService.value
            : {
                status: 'unhealthy',
                error: imagingService.reason?.message || 'Health check failed',
              },
        systemService:
          systemService.status === 'fulfilled'
            ? systemService.value
            : {
                status: 'unhealthy',
                error: systemService.reason?.message || 'Health check failed',
              },
        websocketGateway:
          websocketGateway.status === 'fulfilled'
            ? websocketGateway.value
            : {
                status: 'unhealthy',
                error:
                  websocketGateway.reason?.message || 'Health check failed',
              },
      },
    };

    const allHealthy = Object.values(results.services).every(
      (service: { status: string }) => service.status === 'healthy'
    );

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      ...results,
    };
  }

  @Get('health/user-service')
  @Public()
  @ApiOperation({ summary: 'Check User Service health' })
  @ApiResponse({ status: 200, description: 'User Service health status' })
  async checkUserServiceHealth() {
    return {
      service: 'UserService',
      ...(await this.checkServiceHealth(
        this.userServiceClient,
        'UserService.HealthCheck'
      )),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/patient-service')
  @Public()
  @ApiOperation({ summary: 'Check Patient Service health' })
  @ApiResponse({ status: 200, description: 'Patient Service health status' })
  async checkPatientServiceHealth() {
    return {
      service: 'PatientService',
      ...(await this.checkServiceHealth(
        this.patientServiceClient,
        'PatientService.HealthCheck'
      )),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/imaging-service')
  @Public()
  @ApiOperation({ summary: 'Check Imaging Service health' })
  @ApiResponse({ status: 200, description: 'Imaging Service health status' })
  async checkImagingServiceHealth() {
    return {
      service: 'ImagingService',
      ...(await this.checkServiceHealth(
        this.imagingServiceClient,
        'ImagingService.HealthCheck'
      )),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/system-service')
  @Public()
  @ApiOperation({ summary: 'Check System Service health' })
  @ApiResponse({ status: 200, description: 'System Service health status' })
  async checkSystemServiceHealth() {
    return {
      service: 'SystemService',
      ...(await this.checkServiceHealth(
        this.systemServiceClient,
        'SystemService.HealthCheck'
      )),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/websocket-gateway')
  @Public()
  @ApiOperation({ summary: 'Check WebSocket Gateway health' })
  @ApiResponse({ status: 200, description: 'WebSocket Gateway health status' })
  async checkWebSocketGatewayHealth() {
    return {
      service: 'WebSocketGateway',
      ...(await this.checkServiceHealth(
        this.websocketServiceClient,
        'WebSocketGateway.HealthCheck'
      )),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test/role-reception')
  @Role(Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Test endpoint for Reception Staff role' })
  @ApiResponse({
    status: 200,
    description: 'Access granted for Reception Staff',
  })
  async testReceptionRole() {
    return {
      success: true,
      message: 'Access granted for Reception Staff role',
      role: Roles.RECEPTION_STAFF,
    };
  }

  // Private helper method to check service health
  private async checkServiceHealth(
    serviceClient: ClientProxy,
    pattern: string
  ): Promise<{ status: string; message?: string; error?: string }> {
    // Check if client is available
    if (!serviceClient) {
      return {
        status: 'unhealthy',
        error: 'Service client not available',
      };
    }

    try {
      const response = await firstValueFrom(
        serviceClient.send(pattern, {}).pipe(
          timeout(5000),
          catchError((error) => {
            throw error;
          })
        )
      );
      return {
        status: 'healthy',
        message: response?.message || 'Service is running',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : String(error) || 'Service not available';
      return {
        status: 'unhealthy',
        error: errorMessage,
      };
    }
  }
}
