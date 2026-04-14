import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EquipmentStatus } from '../enums/equipment-status.enum';
import { EquipmentType } from '../enums/equipment-type.enum';

export type EquipmentDocument = HydratedDocument<Equipment>;

@Schema({ timestamps: true, versionKey: false })
export class Equipment {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: Object.values(EquipmentType) })
  type: EquipmentType;

  @Prop({ required: true, type: Date })
  acquisitionDate: Date;

  @Prop({ required: true, enum: Object.values(EquipmentStatus) })
  status: EquipmentStatus;

  createdAt?: Date;

  updatedAt?: Date;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);
