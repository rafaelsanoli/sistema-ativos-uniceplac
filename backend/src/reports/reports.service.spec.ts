import 'reflect-metadata';
import { Types } from 'mongoose';
import { EquipmentStatus } from '../equipments/enums/equipment-status.enum';
import { EquipmentType } from '../equipments/enums/equipment-type.enum';
import { ReportsService } from './reports.service';

jest.mock('../equipments/schemas/equipment.schema', () => ({
  Equipment: class Equipment {},
}));

describe('ReportsService', () => {
  const findExec = jest.fn();
  const equipmentModel = {
    countDocuments: jest.fn((query?: unknown) => {
      const valueMap: Record<string, number> = {
        all: 5,
        ativo: 3,
        manutencao: 2,
        monitor: 2,
        cpu: 2,
        teclado: 1,
      };

      if (!query) {
        return { exec: jest.fn().mockResolvedValue(valueMap.all) };
      }

      const q = query as { status?: EquipmentStatus; type?: EquipmentType };
      if (q.status === EquipmentStatus.ATIVO) {
        return { exec: jest.fn().mockResolvedValue(valueMap.ativo) };
      }
      if (q.status === EquipmentStatus.MANUTENCAO) {
        return { exec: jest.fn().mockResolvedValue(valueMap.manutencao) };
      }
      if (q.type === EquipmentType.MONITOR) {
        return { exec: jest.fn().mockResolvedValue(valueMap.monitor) };
      }
      if (q.type === EquipmentType.CPU) {
        return { exec: jest.fn().mockResolvedValue(valueMap.cpu) };
      }
      if (q.type === EquipmentType.TECLADO) {
        return { exec: jest.fn().mockResolvedValue(valueMap.teclado) };
      }

      return { exec: jest.fn().mockResolvedValue(0) };
    }),
    find: jest.fn(() => ({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: findExec,
    })),
  };

  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    findExec.mockResolvedValue([
      {
        _id: new Types.ObjectId(),
        name: 'CPU Lab 01',
        type: EquipmentType.CPU,
        status: EquipmentStatus.ATIVO,
        acquisitionDate: new Date('2026-01-10'),
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10'),
      },
    ]);

    service = new ReportsService(equipmentModel as never);
  });

  it('deve retornar resumo com totais por status e tipo', async () => {
    const result = await service.getSummary();

    expect(result.total).toBe(5);
    expect(result.byStatus.ativo).toBe(3);
    expect(result.byType.cpu).toBe(2);
  });

  it('deve exportar dados em CSV com cabecalho', async () => {
    const result = await service.exportEquipments({
      format: 'csv',
      search: 'CPU',
    });

    expect(result.format).toBe('csv');
    expect(result.rows).toHaveLength(1);
    expect(result.csv).toContain('id,name,type,status');
    expect(result.csv).toContain('CPU Lab 01');
  });
});