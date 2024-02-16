import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './all-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

//TODO: pagination and swagger documentation and readme.Me
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  const port = 4000;

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('TeLead API')
    .setDescription(
      ' 🚀 TeLead API: Empowering education! Manage courses, users, resources, and track progress effortlessly. Foster collaboration, personalize learning, and scale with ease. Get started today! 🎓🌟',
    )
    .setVersion('1.0')
    .addTag('TeLead')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port, () => {
    console.log(`Your app is running on port ${port}`);
  });
}

bootstrap();
