import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EquipmentStatus } from '../equipments/enums/equipment-status.enum';
import { EquipmentType } from '../equipments/enums/equipment-type.enum';
import { Equipment } from '../equipments/schemas/equipment.schema';
import { ExportQueryDto } from './dto/export-query.dto';

type ExportRow = {
  id: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  acquisitionDate: string;
  createdAt: string;
  updatedAt: string;
};

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toCsv(rows: ExportRow[]) {
  const headers = [
    'id',
    'name',
    'type',
    'status',
    'acquisitionDate',
    'createdAt',
    'updatedAt',
  ];

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const lines = rows.map((row) =>
    [
      row.id,
      row.name,
      row.type,
      row.status,
      row.acquisitionDate,
      row.createdAt,
      row.updatedAt,
    ]
      .map((value) => escape(value))
      .join(','),
  );

  return `${headers.join(',')}\n${lines.join('\n')}`;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Equipment.name)
    private readonly equipmentModel: Model<Equipment>,
  ) {}

  async getSummary() {
    const [total, ativos, manutencao, monitors, cpus, teclados] =
      await Promise.all([
        this.equipmentModel.countDocuments().exec(),
        this.equipmentModel
          .countDocuments({ status: EquipmentStatus.ATIVO })
          .exec(),
        this.equipmentModel
          .countDocuments({ status: EquipmentStatus.MANUTENCAO })
          .exec(),
        this.equipmentModel
          .countDocuments({ type: EquipmentType.MONITOR })
          .exec(),
        this.equipmentModel.countDocuments({ type: EquipmentType.CPU }).exec(),
        this.equipmentModel
          .countDocuments({ type: EquipmentType.TECLADO })
          .exec(),
      ]);

    return {
      total,
      byStatus: {
        ativo: ativos,
        manutencao,
      },
      byType: {
        monitor: monitors,
        cpu: cpus,
        teclado: teclados,
      },
    };
  }

  async exportEquipments(query: ExportQueryDto) {
    const filters: {
      type?: EquipmentType;
      status?: EquipmentStatus;
      name?: { $regex: string; $options: string };
    } = {};

    if (query.type) {
      filters.type = query.type;
    }

    if (query.status) {
      filters.status = query.status;
    }

    if (query.search) {
      const normalizedSearch = query.search.trim().slice(0, 60);
      if (normalizedSearch.length >= 2) {
        filters.name = {
          $regex: escapeRegex(normalizedSearch),
          $options: 'i',
        };
      }
    }

    const documents = await this.equipmentModel
      .find(filters)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const rows: ExportRow[] = documents.map((doc) => ({
      id: String(doc._id),
      name: String(doc.name ?? ''),
      type: doc.type,
      status: doc.status,
      acquisitionDate: doc.acquisitionDate
        ? new Date(doc.acquisitionDate).toISOString()
        : '',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    }));

    return {
      format: query.format ?? 'csv',
      rows,
      csv: toCsv(rows),
    };
  }
}
