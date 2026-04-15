import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentType } from '../enums/equipment-type.enum';

export class UpdateEquipmentDto {
  @ApiPropertyOptional({ example: 'CPU Laboratorio 01' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: EquipmentType, example: EquipmentType.CPU })
  @IsEnum(EquipmentType)
  @IsOptional()
  type?: EquipmentType;

  @ApiPropertyOptional({ example: '2026-04-10' })
  @IsDateString()
  @IsOptional()
  acquisitionDate?: string;

  @ApiPropertyOptional({
    enum: EquipmentStatus,
    example: EquipmentStatus.MANUTENCAO,
  })
  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;
}
