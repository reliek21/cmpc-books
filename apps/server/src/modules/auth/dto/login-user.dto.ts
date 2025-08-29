import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    name: 'email',
    description: 'Email of the user',
    example: 'example@gmail.com',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsEmail()
  public email: string;

  @ApiProperty({
    name: 'password',
    description: 'Password of the user',
    example: '************',
    required: true,
  })
  @IsDefined()
  @IsString()
  public password: string;
}
