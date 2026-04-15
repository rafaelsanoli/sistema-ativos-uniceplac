import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentType } from '../enums/equipment-type.enum';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Monitor Dell 24' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: EquipmentType, example: EquipmentType.MONITOR })
  @IsEnum(EquipmentType)
  type: EquipmentType;

  @ApiProperty({ example: '2026-04-10' })
  @IsDateString()
  acquisitionDate: string;

  @ApiProperty({ enum: EquipmentStatus, example: EquipmentStatus.ATIVO })
  @IsEnum(EquipmentStatus)
  status: EquipmentStatus;
}
