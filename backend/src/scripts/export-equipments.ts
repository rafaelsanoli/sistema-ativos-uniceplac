import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import mongoose from 'mongoose';
import {
  Equipment,
  EquipmentSchema,
} from '../equipments/schemas/equipment.schema';

type ExportFormat = 'json' | 'csv' | 'all';

type ExportRow = {
  id: string;
  name: string;
  type: string;
  acquisitionDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type LeanEquipment = {
  _id: unknown;
  name?: string;
  type?: string;
  acquisitionDate?: Date | string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

function toIsoOrEmpty(value: Date | string | undefined) {
  return value ? new Date(value).toISOString() : '';
}

function toCsv(rows: ExportRow[]) {
  const headers = [
    'id',
    'name',
    'type',
    'acquisitionDate',
    'status',
    'createdAt',
    'updatedAt',
  ];

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const body = rows
    .map((row) =>
      [
        row.id,
        row.name,
        row.type,
        row.acquisitionDate,
        row.status,
        row.createdAt,
        row.updatedAt,
      ]
        .map((value) => escape(value))
        .join(','),
    )
    .join('\n');

  return `${headers.join(',')}\n${body}`;
}

async function exportEquipments() {
  const formatArg = (process.argv[2] ?? 'all').toLowerCase() as ExportFormat;
  const validFormats: ExportFormat[] = ['json', 'csv', 'all'];

  if (!validFormats.includes(formatArg)) {
    throw new Error('Formato invalido. Use: json, csv ou all.');
  }

  const mongoUri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/uniceplac-assets';

  await mongoose.connect(mongoUri);
  const EquipmentModel = mongoose.model(Equipment.name, EquipmentSchema);

  const documents = await EquipmentModel.find()
    .sort({ createdAt: -1 })
    .lean<LeanEquipment[]>()
    .exec();

  const rows: ExportRow[] = documents.map((document) => ({
    id: String(document._id),
    name: String(document.name ?? ''),
    type: String(document.type ?? ''),
    acquisitionDate: toIsoOrEmpty(document.acquisitionDate),
    status: String(document.status ?? ''),
    createdAt: toIsoOrEmpty(document.createdAt),
    updatedAt: toIsoOrEmpty(document.updatedAt),
  }));

  const outputDir = join(process.cwd(), 'exports');
  await mkdir(outputDir, { recursive: true });

  if (formatArg === 'json' || formatArg === 'all') {
    const jsonPath = join(outputDir, 'equipments.json');
    await writeFile(jsonPath, JSON.stringify(rows, null, 2), 'utf-8');

    console.log(`Arquivo JSON gerado em: ${jsonPath}`);
  }

  if (formatArg === 'csv' || formatArg === 'all') {
    const csvPath = join(outputDir, 'equipments.csv');
    await writeFile(csvPath, toCsv(rows), 'utf-8');

    console.log(`Arquivo CSV gerado em: ${csvPath}`);
  }

  await mongoose.disconnect();
}

void exportEquipments().catch(async (error: unknown) => {
  console.error('Falha ao exportar equipamentos:', error);
  await mongoose.disconnect();
  process.exit(1);
});
