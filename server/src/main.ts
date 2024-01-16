import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

import { CustomLogger } from "./custom-logger";
import { AppModule } from "./modules/app.module";
import { NotFoundExceptionFilter } from "./exception-handlers/404";
import { UnauthorizedExceptionFilter } from "./exception-handlers/401";
import { InternalServerExceptionFilter } from "./exception-handlers/500";
import { BadRequestExceptionFilter } from "./exception-handlers/400/filter";
import { UnprocessableEntityExceptionFilter } from "./exception-handlers/422/filter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { logger: new CustomLogger("Welcome to Chirp!") });

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
