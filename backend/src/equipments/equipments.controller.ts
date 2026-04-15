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
  ApiForbiddenResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CSRF_HEADER_NAME } from '../auth/auth.constants';
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
  @HttpCode(HttpStatus.OK)
  @ApiSecurity(CSRF_HEADER_NAME)
  @ApiOperation({ summary: 'Criar equipamento' })
  @ApiOkResponse({ description: 'Equipamento criado com sucesso.' })
  @ApiForbiddenResponse({ description: 'Token CSRF invalido.' })
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
  @ApiSecurity(CSRF_HEADER_NAME)
  @ApiOperation({ summary: 'Atualizar equipamento' })
  @ApiOkResponse({ description: 'Equipamento atualizado com sucesso.' })
  @ApiForbiddenResponse({ description: 'Token CSRF invalido.' })
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentsService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSecurity(CSRF_HEADER_NAME)
  @ApiOperation({ summary: 'Remover equipamento' })
  @ApiNoContentResponse({ description: 'Equipamento removido com sucesso.' })
  @ApiForbiddenResponse({ description: 'Token CSRF invalido.' })
  async remove(@Param('id') id: string) {
    await this.equipmentsService.remove(id);
  }
}
