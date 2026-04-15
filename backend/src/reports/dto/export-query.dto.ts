import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { EquipmentStatus } from '../../equipments/enums/equipment-status.enum';
import { EquipmentType } from '../../equipments/enums/equipment-type.enum';

export class ExportQueryDto {
  @ApiPropertyOptional({ example: 'lab' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  search?: string;

  @ApiPropertyOptional({ enum: EquipmentType, example: EquipmentType.MONITOR })
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

  @ApiPropertyOptional({ enum: ['json', 'csv'], example: 'csv' })
  @IsEnum(['json', 'csv'])
  @IsOptional()
  format?: 'json' | 'csv';
}
