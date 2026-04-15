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
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { FilterEquipmentDto } from './dto/filter-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentsService } from './equipments.service';

@ApiTags('Equipments')
@ApiCookieAuth()
@Controller('equipments')
@UseGuards(JwtAuthGuard)
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar equipamento' })
  @ApiOkResponse({ description: 'Equipamento criado com sucesso.' })
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentsService.create(createEquipmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar equipamentos com filtros e paginacao' })
  @ApiOkResponse({ description: 'Lista paginada de equipamentos.' })
  findAll(@Query() filters: FilterEquipmentDto) {
    return this.equipmentsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar equipamento por id' })
  @ApiOkResponse({ description: 'Detalhes do equipamento.' })
  findOne(@Param('id') id: string) {
    return this.equipmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar equipamento' })
  @ApiOkResponse({ description: 'Equipamento atualizado com sucesso.' })
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentsService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover equipamento' })
  @ApiNoContentResponse({ description: 'Equipamento removido com sucesso.' })
  async remove(@Param('id') id: string) {
    await this.equipmentsService.remove(id);
  }
}
