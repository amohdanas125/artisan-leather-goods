import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const frontendUrl = config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
  app.enableCors({
    origin: [frontendUrl, "http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:4173"],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not defined on the DTO
      transform: true, // applies @Type()/coercion from class-transformer
      forbidNonWhitelisted: true,
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix("api"); // all routes are served under /api/*

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
  console.log(`Tanner & Co. backend running on http://localhost:${port}/api`);
}

bootstrap();
