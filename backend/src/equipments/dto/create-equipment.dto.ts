import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentType } from '../enums/equipment-type.enum';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(EquipmentType)
  type: EquipmentType;

  @IsDateString()
  acquisitionDate: string;

  @IsEnum(EquipmentStatus)
  status: EquipmentStatus;
}
