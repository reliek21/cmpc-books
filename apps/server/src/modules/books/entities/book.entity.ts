import {
  Column,
  Model,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'books',
  timestamps: true,
  underscored: true,
  paranoid: true, // soft delete
  indexes: [
    {
      name: 'books_user_id_idx',
      fields: ['user_id'],
    },
    {
      name: 'books_title_idx',
      fields: ['title'],
    },
    {
      name: 'books_genre_idx',
      fields: ['genre'],
    },
    {
      name: 'books_is_active_idx',
      fields: ['is_active'],
    },
  ],
})
export class Book extends Model<Book> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, field: 'user_id' })
  declare userId: string;

  @BelongsTo(() => User, { onDelete: 'CASCADE', hooks: true })
  declare user: User;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
    validate: { notEmpty: true },
  })
  declare title: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    validate: { notEmpty: true },
  })
  declare author: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    validate: { notEmpty: true },
  })
  declare publisher: string;

  @Column({
    type: DataType.STRING(80),
    allowNull: false,
    validate: { notEmpty: true },
  })
  declare genre: string;

  @Column({
    field: 'is_active',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    field: 'image_url',
    type: DataType.TEXT,
    allowNull: true,
  })
  declare imageUrl?: string;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  declare deletedAt?: Date;
}
