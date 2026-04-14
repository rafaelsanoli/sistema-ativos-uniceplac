import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentType } from '../enums/equipment-type.enum';

export class FilterEquipmentDto {
  @IsEnum(EquipmentType)
  @IsOptional()
  type?: EquipmentType;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsString()
  @IsOptional()
  search?: string;
}
