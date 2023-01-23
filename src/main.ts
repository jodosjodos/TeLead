import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './all-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));
  app.setGlobalPrefix('api/v1');
  await app.listen(4000, () => {
    console.log('your app is no port 4000');
  });
  // swagger configuration
  const config = new DocumentBuilder()
    .setTitle('TeLead API')
    .setDescription('e-learning back-end  apis')
    .setVersion('1.0')
    .addTag('TeLead')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);
}
bootstrap();
