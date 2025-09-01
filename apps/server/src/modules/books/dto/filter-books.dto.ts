import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterBooksDto {
  @ApiPropertyOptional({
    example: 'Hemingway',
    description: 'Search term for title, author, publisher, or genre',
  })
  @IsOptional()
  @IsString()
  public search?: string;

  @ApiPropertyOptional({
    example: 'Fiction',
    description: 'Filter by genre',
  })
  @IsOptional()
  @IsString()
  public genre?: string;

  @ApiPropertyOptional({
    example: 'Scribner',
    description: 'Filter by publisher',
  })
  @IsOptional()
  @IsString()
  public publisher?: string;

  @ApiPropertyOptional({
    example: 'Ernest Hemingway',
    description: 'Filter by author',
  })
  @IsOptional()
  @IsString()
  public author?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by availability',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  public available?: boolean;

  @ApiPropertyOptional({
    example: 'title:asc,author:desc,createdAt:desc',
    description:
      'Sort fields with direction (asc/desc). Available fields: title, author, publisher, genre, available, createdAt, updatedAt. Multiple sorts separated by comma.',
  })
  @IsOptional()
  @IsString()
  public sort?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (starts from 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public per_page?: number = 10;
}
