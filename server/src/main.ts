import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { ValidationPipe } from "@nestjs/common";
import { InternalServerExceptionFilter } from "./exception-handlers/500";
import { NotFoundExceptionFilter } from "./exception-handlers/404";
import { BadRequestExceptionFilter } from "./exception-handlers/400";
import { UnauthorizedExceptionFilter } from "./exception-handlers/401";
import { UnprocessableEntityExceptionFilter } from "./exception-handlers/422";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalFilters(
		new InternalServerExceptionFilter(),
		new NotFoundExceptionFilter(),
		new BadRequestExceptionFilter(),
		new UnauthorizedExceptionFilter(),
		new UnprocessableEntityExceptionFilter(),
	);

	await app.listen(process.env.PORT);
}

bootstrap();
