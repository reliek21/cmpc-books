import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UserService) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.createUser({
			email: createUserDto.email,
			password: createUserDto.password,
			first_name: createUserDto.first_name,
			last_name: createUserDto.last_name,
		});
	}

	@Get()
	findAll() {
		return this.usersService.getAllUsers();
	}
}
