import { IsDefined, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @IsOptional()
  public id?: string;

  @ApiProperty({ example: 'The Old Man and the Sea' })
  @IsDefined()
  @IsString()
  public title!: string;

  @ApiProperty({ example: 'Ernest Hemingway' })
  @IsOptional()
  @IsString()
  public author?: string;

  @ApiProperty({ example: 'Scribner' })
  @IsOptional()
  @IsString()
  public publisher?: string;

  @ApiProperty({ example: 'Fiction' })
  @IsOptional()
  @IsString()
  public genre?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  public available?: boolean;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsString()
  public cover?: string;
}
