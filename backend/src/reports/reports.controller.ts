import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportQueryDto } from './dto/export-query.dto';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('equipments/summary')
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('equipments/export')
  async exportEquipments(
    @Query() query: ExportQueryDto,
    @Res() response: Response,
  ) {
    const result = await this.reportsService.exportEquipments(query);
    const fileName = `equipments-${new Date().toISOString().slice(0, 10)}`;

    if (result.format === 'json') {
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}.json"`,
      );
      response.send(JSON.stringify(result.rows, null, 2));
      return;
    }

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}.csv"`,
    );
    response.send(result.csv);
  }
}
