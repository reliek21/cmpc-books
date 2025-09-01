import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiPropertyOptional({
    description: 'Book title',
    example: 'The Great Gatsby',
  })
  @IsOptional()
  @IsString()
  public title?: string;

  @ApiPropertyOptional({
    description: 'Book author',
    example: 'F. Scott Fitzgerald',
  })
  @IsOptional()
  @IsString()
  public author?: string;

  @ApiPropertyOptional({
    description: 'Book publisher',
    example: 'Scribner',
  })
  @IsOptional()
  @IsString()
  public publisher?: string;

  @ApiPropertyOptional({
    description: 'Book genre',
    example: 'Fiction',
  })
  @IsOptional()
  @IsString()
  public genre?: string;

  @ApiPropertyOptional({
    description: 'Book availability status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  public is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Book cover image URL',
    example: '/uploads/books/image.jpg',
  })
  @IsOptional()
  @IsString()
  public image_url?: string;
}
