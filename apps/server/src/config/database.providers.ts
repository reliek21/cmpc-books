import { Sequelize } from 'sequelize-typescript';
import { User } from 'src/modules/users/entities/user.entity';
import { Book } from 'src/modules/books/entities/book.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost', // process.env.DATABASE_HOST!,
        port: 5432, // Number(process.env.DATABASE_PORT!),
        username: 'cmpc123', // process.env.DATABASE_USER!,
        password: 'postgrescmpc', // String(process.env.DATABASE_PASSWORD!),
        database: 'cmpc', // process.env.DATABASE_NAME!,
      });
      sequelize.addModels([User, Book]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
