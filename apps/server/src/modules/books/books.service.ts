import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';

@Injectable()
export class BooksService {
	constructor(
		@InjectModel(Book)
		private bookModel: typeof Book,
	) {}

	async create(createBookDto: CreateBookDto): Promise<Book> {
		return await this.bookModel.create(createBookDto as any);
	}

	async findAll(filterDto: FilterBooksDto): Promise<{
		data: Book[];
		total: number;
		page: number;
		per_page: number;
		total_pages: number;
	}> {
		const {
			search,
			genre,
			publisher,
			author,
			available,
			sort,
			page = 1,
			per_page = 10,
		} = filterDto;

		const where: any = {};

		if (search) {
			where[Op.or] = [
				{ title: { [Op.iLike]: `%${search}%` } },
				{ author: { [Op.iLike]: `%${search}%` } },
				{ publisher: { [Op.iLike]: `%${search}%` } },
				{ genre: { [Op.iLike]: `%${search}%` } },
			];
		}

		if (genre) {
			where.genre = { [Op.iLike]: `%${genre}%` };
		}

		if (publisher) {
			where.publisher = { [Op.iLike]: `%${publisher}%` };
		}

		if (author) {
			where.author = { [Op.iLike]: `%${author}%` };
		}

		if (available !== undefined) {
			where.available = available;
		}

		let order: any[] = [['createdAt', 'DESC']];

		if (sort) {
			const sortFields = sort.split(',').map((s) => s.trim());
			order = sortFields.map((sortField) => {
				const [field, direction = 'asc'] = sortField.split(':');
				let dbField = field;
				if (field === 'created_at') {
					dbField = 'createdAt';
				}
				return [dbField, direction.toUpperCase()];
			});
		}

		const offset = (page - 1) * per_page;

		const { rows: data, count: total } = await this.bookModel.findAndCountAll({
			where,
			order,
			limit: per_page,
			offset,
		});

		const total_pages = Math.ceil(total / per_page);

		return {
			data,
			total,
			page,
			per_page,
			total_pages,
		};
	}

	async findOne(id: number): Promise<Book> {
		const book = await this.bookModel.findByPk(id);
		if (!book) {
			throw new NotFoundException(`Book with ID ${id} not found`);
		}
		return book;
	}

	async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
		const book = await this.findOne(id);
		await book.update(updateBookDto);
		return book;
	}

	async remove(id: number): Promise<void> {
		const book = await this.findOne(id);
		await book.destroy();
	}

	async restore(id: number): Promise<Book> {
		const book = await this.bookModel.findByPk(id, { paranoid: false });
		if (!book) {
			throw new NotFoundException(`Book with ID ${id} not found`);
		}
		if (!book.deletedAt) {
			throw new Error(`Book with ID ${id} is not deleted`);
		}
		await book.restore();
		return book;
	}

	async findDeleted(): Promise<Book[]> {
		return this.bookModel
			.findAll({
				where: {},
				paranoid: false,
				order: [['deletedAt', 'DESC']],
			})
			.then((books) => books.filter((book) => book.deletedAt !== null));
	}

	async getFilterOptions(): Promise<{
		genres: string[];
		authors: string[];
		publishers: string[];
	}> {
		try {
			const sequelize = this.bookModel.sequelize;
			if (!sequelize) {
				throw new Error('Sequelize instance not found');
			}

			const [genresResult, authorsResult, publishersResult] = await Promise.all(
				[
					sequelize.query(
						"SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND genre != '' ORDER BY genre",
						{ type: 'SELECT' },
					),
					sequelize.query(
						"SELECT DISTINCT author FROM books WHERE author IS NOT NULL AND author != '' ORDER BY author",
						{ type: 'SELECT' },
					),
					sequelize.query(
						"SELECT DISTINCT publisher FROM books WHERE publisher IS NOT NULL AND publisher != '' ORDER BY publisher",
						{ type: 'SELECT' },
					),
				],
			);

			const genres = (genresResult as any[])
				.map((item: any) => item.genre)
				.filter(Boolean);
			const authors = (authorsResult as any[])
				.map((item: any) => item.author)
				.filter(Boolean);
			const publishers = (publishersResult as any[])
				.map((item: any) => item.publisher)
				.filter(Boolean);

			return {
				genres,
				authors,
				publishers,
			};
		} catch (error) {
			console.error('Error fetching filter options:', error);
			return {
				genres: [],
				authors: [],
				publishers: [],
			};
		}
	}
}
