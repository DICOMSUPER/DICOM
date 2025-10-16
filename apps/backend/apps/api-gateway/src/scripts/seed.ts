import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

async function bootstrap() {
  const logger = new Logger('GatewaySeedScript');
  
  try {
    logger.log('🚀 Starting centralized seeding script...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const userServiceClient = app.get<ClientProxy>('USER_SERVICE');
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'run';
    
    switch (command) {
      case 'run':
        logger.log('📊 Running centralized database seeding...');
        await firstValueFrom(userServiceClient.send('UserService.Seeding.Run', {}));
        break;
        
      case 'reset':
        logger.log('🔄 Resetting and seeding all services...');
        await firstValueFrom(userServiceClient.send('UserService.Seeding.ResetAndSeed', {}));
        break;
        
      case 'clear':
        logger.log('🗑️ Clearing all data from all services...');
        await firstValueFrom(userServiceClient.send('UserService.Seeding.ClearAllData', {}));
        break;
        
      case 'departments':
        logger.log('🏢 Seeding departments only...');
        await firstValueFrom(userServiceClient.send('UserService.Seeding.SeedDepartments', {}));
        break;
        
      case 'users':
        logger.log('👥 Seeding users only...');
        await firstValueFrom(userServiceClient.send('UserService.Seeding.SeedUsers', {}));
        break;
        
      case 'rooms':
        logger.log('🏥 Seeding rooms only...');
        await firstValueFrom(userServiceClient.send('UserService.Seeding.SeedRooms', {}));
        break;
        
      case 'shift-templates':
        logger.log('⏰ Seeding shift templates only...');
        await firstValueFrom(userServiceClient.send('UserService.Seeding.SeedShiftTemplates', {}));
        break;
        
      case 'status':
        logger.log('📊 Getting seeding status from all services...');
        const status = await firstValueFrom(userServiceClient.send('UserService.Seeding.GetStatus', {}));
        console.log(JSON.stringify(status, null, 2));
        break;
        
      default:
        logger.error(`❌ Unknown command: ${command}`);
        logger.log('Available commands:');
        logger.log('  run              - Run centralized database seeding');
        logger.log('  reset            - Reset and seed centralized database');
        logger.log('  clear            - Clear all centralized data');
        logger.log('  departments      - Seed departments only');
        logger.log('  users            - Seed users only');
        logger.log('  rooms            - Seed rooms only');
        logger.log('  shift-templates  - Seed shift templates only');
        logger.log('  status           - Get seeding status');
        process.exit(1);
    }
    
    logger.log('✅ Centralized seeding script completed successfully!');
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Centralized seeding script failed:', error);
    process.exit(1);
  }
}

bootstrap();
