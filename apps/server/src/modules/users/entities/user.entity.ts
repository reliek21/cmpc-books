import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasMany,
  DefaultScope,
  Unique,
} from 'sequelize-typescript';

import { Book } from '../../books/entities/book.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['password'] }, // Hides password by default
}))
@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  declare id: string;

  @Default(true)
  @Column({ type: DataType.BOOLEAN })
  declare is_active: boolean;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare first_name: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare last_name: string;

  @Unique('users_email_unique')
  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  })
  declare email: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare password: string;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare created_at: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updated_at?: Date | null;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  declare deleted_at?: Date | null;

  @HasMany(() => Book)
  declare books: Book[];
}
