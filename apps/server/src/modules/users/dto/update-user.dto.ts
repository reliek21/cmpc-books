import { IsDate, IsOptional } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    name: 'updated_at',
    description: 'Update date',
    example: '2021-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  public updated_at?: Date;

  @ApiPropertyOptional({
    name: 'deleted_at',
    description: 'Deletion date',
    example: '2021-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  public readonly deleted_at?: Date;
}
