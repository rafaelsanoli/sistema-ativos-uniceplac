import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { FilterEquipmentDto } from './dto/filter-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentsService } from './equipments.service';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Post()
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentsService.create(createEquipmentDto);
  }

  @Get()
  findAll(@Query() filters: FilterEquipmentDto) {
    return this.equipmentsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentsService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.equipmentsService.remove(id);
  }
}
