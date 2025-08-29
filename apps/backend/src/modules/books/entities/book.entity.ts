import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'books',
  timestamps: true,
})
export class Book extends Model<Book> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  author: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  publisher: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  genre: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  available: boolean;
}
