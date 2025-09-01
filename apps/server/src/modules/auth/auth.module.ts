import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { PasswordService } from '../../core/services/password.service';
import { PasswordHelper } from '../../core/helpers/password.helper';

@Module({
	controllers: [AuthController],
	providers: [
		AuthService,
		RegisterUseCase,
		LoginUseCase,
		PasswordService,
		PasswordHelper,
	],
	imports: [UsersModule],
	exports: [AuthService],
})
export class AuthModule {}
