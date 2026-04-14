import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquipmentsController } from './equipments.controller';
import { EquipmentsService } from './equipments.service';
import { Equipment, EquipmentSchema } from './schemas/equipment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Equipment.name,
        schema: EquipmentSchema,
      },
    ]),
  ],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
})
export class EquipmentsModule {}
