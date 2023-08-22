require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';

process.on('uncaughtException', function (err) {
  console.log('main.ts - Uncaught exception: ', err);
  console.log(err.stack);
});

declare const module: any;

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: true });
  adapter.register(multipart, {
    limits: {
      fieldNameSize: 10000, // Max field name size in bytes
      fieldSize: 1024 * 1024, // Max field value size in bytes
      fields: 100, // Max number of non-file fields
      fileSize: 100 * 1024 * 1024, // For multipart forms, the max file size in bytes
      files: 100 // Max number of file fields
    }
  });
  const app = await NestFactory.create(AppModule, adapter);

  const memoryData = process.memoryUsage();
  const formatMemoryUsage = (data) => Math.round((data / 1024 / 1024) * 100) / 100;

  function logger(req, res, next) {
    console.log(
      req.method,
      req.url,
      formatMemoryUsage(memoryData.heapUsed),
      formatMemoryUsage(memoryData.heapTotal)
    );
    next();
  }

  app.use(logger);
  app.enableCors();

  app.setGlobalPrefix('api');

  await app.listen(3005, '0.0.0.0');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
