import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { configureHttp } from './config/configure-http.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mantém as configurações existentes de segurança e HTTP.
  configureHttp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Currículo Express IA — API')
    .setDescription(
      'Documentação da API do Currículo Express IA. ' +
      'Permite criar sessões anônimas, gerenciar currículos, ' +
      'melhorar textos com IA e gerar documentos em PDF e DOCX.',
    )
    .setVersion('1.0.0')
    .addTag('Sessões', 'Gerenciamento de sessões anônimas')
    .addTag('Currículos', 'Criação e edição de currículos')
    .addTag('Inteligência Artificial', 'Melhoria de textos com IA')
    .addTag('Documentos', 'Pré-visualização e downloads')
    .addCookieAuth('ce_session', {
      type: 'apiKey',
      in: 'cookie',
      name: 'ce_session',
      description: 'Cookie HttpOnly criado pela API de sessões.',
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup(
    'api/docs',
    app,
    swaggerDocument,
    {
      customSiteTitle: 'Currículo Express IA | API Docs',
    },
  );

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port);

  console.log(`API iniciada em http://localhost:${port}`);
  console.log(
    `Swagger disponível em http://localhost:${port}/api/docs`,
  );
}

void bootstrap();