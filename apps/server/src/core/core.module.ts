import { Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';
import { PasswordHelper } from './helpers/password.helper';

@Module({
  providers: [PasswordService, PasswordHelper],
  exports: [PasswordService, PasswordHelper],
})
export class CoreModule {}
