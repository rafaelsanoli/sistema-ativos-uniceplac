import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentType } from '../enums/equipment-type.enum';

export class UpdateEquipmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(EquipmentType)
  @IsOptional()
  type?: EquipmentType;

  @IsDateString()
  @IsOptional()
  acquisitionDate?: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;
}
