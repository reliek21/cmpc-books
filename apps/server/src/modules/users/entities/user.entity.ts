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
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  declare id: string;

  @Default(true)
  @Column({ type: DataType.BOOLEAN })
  declare is_active: boolean;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare created_at: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updated_at?: Date | null;

  @DeletedAt
  @Column({ field: 'deleted_at', type: DataType.DATE })
  declare deleted_at?: Date | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare first_name?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare last_name?: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare email: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare password: string;
}
