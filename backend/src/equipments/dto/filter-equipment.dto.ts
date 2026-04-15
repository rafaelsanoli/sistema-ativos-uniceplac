import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentType } from '../enums/equipment-type.enum';

export class FilterEquipmentDto {
  @ApiPropertyOptional({ enum: EquipmentType, example: EquipmentType.CPU })
  @IsEnum(EquipmentType)
  @IsOptional()
  type?: EquipmentType;

  @ApiPropertyOptional({
    enum: EquipmentStatus,
    example: EquipmentStatus.ATIVO,
  })
  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @ApiPropertyOptional({ example: 'monitor' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 5, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(50)
  @IsOptional()
  limit?: number;
}
