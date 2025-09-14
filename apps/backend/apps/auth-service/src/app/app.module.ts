import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, BackendEntitiesModule } from '@backend/entities';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,          
    BackendEntitiesModule,   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
