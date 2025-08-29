import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiPropertyOptional({ example: 'The Great Gatsby' })
  @IsOptional()
  @IsString()
  public title?: string;

  @ApiPropertyOptional({ example: 'F. Scott Fitzgerald' })
  @IsOptional()
  @IsString()
  public author?: string;

  @ApiPropertyOptional({ example: 'Scribner' })
  @IsOptional()
  @IsString()
  public publisher?: string;

  @ApiPropertyOptional({ example: 'Fiction' })
  @IsOptional()
  @IsString()
  public genre?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  public available?: boolean;
}
