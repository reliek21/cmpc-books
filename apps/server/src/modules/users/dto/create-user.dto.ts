import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  public id?: string;

  @ApiProperty({
    name: 'first_name',
    description: 'First name of the user',
    example: 'John',
    required: true,
  })
  @IsDefined()
  @IsString()
  public first_name: string;

  @ApiProperty({
    name: 'last_name',
    description: 'Last name of the user',
    example: 'Doe',
    required: true,
  })
  @IsDefined()
  @IsString()
  public last_name: string;

  @ApiProperty({
    name: 'email',
    description: 'Email of the user',
    example: 'example@cmpc.com',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsEmail()
  public email: string;

  @ApiProperty({
    name: 'password',
    description: 'Password of the user',
    example: 'password',
    required: true,
  })
  @IsDefined()
  @IsString()
  public password: string;
}
