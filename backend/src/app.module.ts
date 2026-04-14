import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquipmentsModule } from './equipments/equipments.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/uniceplac-assets',
    ),
    EquipmentsModule,
  ],
})
export class AppModule {}
