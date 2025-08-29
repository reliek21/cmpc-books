import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  publisher: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsBoolean()
  available?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
