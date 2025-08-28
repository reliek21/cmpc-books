import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiProperty({ example: 'The Old Man and the Sea', required: false })
  @IsOptional()
  @IsString()
  public title?: string;

  @ApiProperty({ example: 'Ernest Hemingway', required: false })
  @IsOptional()
  @IsString()
  public author?: string;

  @ApiProperty({ example: 'Scribner', required: false })
  @IsOptional()
  @IsString()
  public publisher?: string;

  @ApiProperty({ example: 'Fiction', required: false })
  @IsOptional()
  @IsString()
  public genre?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  public available?: boolean;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsString()
  public cover?: string;
}
