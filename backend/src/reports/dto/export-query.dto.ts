import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { EquipmentStatus } from '../../equipments/enums/equipment-status.enum';
import { EquipmentType } from '../../equipments/enums/equipment-type.enum';

export class ExportQueryDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  search?: string;

  @IsEnum(EquipmentType)
  @IsOptional()
  type?: EquipmentType;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsEnum(['json', 'csv'])
  @IsOptional()
  format?: 'json' | 'csv';
}
