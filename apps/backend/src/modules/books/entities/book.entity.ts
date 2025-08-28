import { UUIDV4 } from 'sequelize';
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
} from 'sequelize-typescript';

@Table({
  tableName: 'books',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Book extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string;

  @Default(true)
  @Column({ type: DataType.BOOLEAN })
  declare available: boolean;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare created_at: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updated_at?: Date | null;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  declare deleted_at?: Date | null;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare author?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare publisher?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare genre?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare cover?: string;
}
