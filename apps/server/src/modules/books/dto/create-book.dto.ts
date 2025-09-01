import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
	@ApiProperty({
		description: 'Book title',
		example: 'The Great Gatsby',
		minLength: 1,
	})
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({
		description: 'Book author',
		example: 'F. Scott Fitzgerald',
		minLength: 1,
	})
	@IsString()
	@IsNotEmpty()
	author: string;

	@ApiProperty({
		description: 'Book publisher',
		example: 'Scribner',
		minLength: 1,
	})
	@IsString()
	@IsNotEmpty()
	publisher: string;

	@ApiProperty({
		description: 'Book genre',
		example: 'Fiction',
		minLength: 1,
	})
	@IsString()
	@IsNotEmpty()
	genre: string;

	@ApiPropertyOptional({
		description: 'Book availability status',
		example: true,
		default: true,
	})
	@IsBoolean()
	available?: boolean;

	@ApiPropertyOptional({
		description: 'Book cover image URL',
		example: '/uploads/books/great-gatsby.jpg',
	})
	@IsString()
	@IsOptional()
	imageUrl?: string;
}
