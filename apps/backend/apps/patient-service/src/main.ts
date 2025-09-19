import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PatientModule } from './patient.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(PatientModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Patient Service API')
    .setDescription('The Patient service API description')
    .setVersion('1.0')
    .addTag('patients')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();