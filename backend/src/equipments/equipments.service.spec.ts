import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EquipmentStatus } from './enums/equipment-status.enum';
import { EquipmentType } from './enums/equipment-type.enum';
import { EquipmentsService } from './equipments.service';

jest.mock('./schemas/equipment.schema', () => ({
  Equipment: class Equipment {},
}));

describe('EquipmentsService', () => {
  let service: EquipmentsService;

  const findExec = jest.fn();
  const findChain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: findExec,
  };

  const equipmentModel = {
    create: jest.fn(),
    countDocuments: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(3) })),
    find: jest.fn(() => findChain),
    findById: jest.fn(() => ({ exec: jest.fn() })),
    findByIdAndUpdate: jest.fn(() => ({ exec: jest.fn() })),
    findByIdAndDelete: jest.fn(() => ({ exec: jest.fn() })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    findExec.mockResolvedValue([
      {
        _id: new Types.ObjectId(),
        name: 'Monitor 24',
        type: EquipmentType.MONITOR,
        status: EquipmentStatus.ATIVO,
      },
    ]);

    service = new EquipmentsService(equipmentModel as never);
  });

  it('deve retornar listagem paginada com meta', async () => {
    const result = await service.findAll({
      page: 2,
      limit: 10,
      search: 'Monitor',
      type: EquipmentType.MONITOR,
      status: EquipmentStatus.ATIVO,
    });

    expect(equipmentModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EquipmentType.MONITOR,
        status: EquipmentStatus.ATIVO,
        name: expect.objectContaining({
          $regex: 'Monitor',
        }),
      }),
    );
    expect(findChain.skip).toHaveBeenCalledWith(10);
    expect(findChain.limit).toHaveBeenCalledWith(10);
    expect(result.meta.page).toBe(2);
    expect(result.meta.total).toBe(3);
  });

  it('deve lancar not found para id invalido', async () => {
    await expect(service.findOne('id-invalido')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve remover equipamento existente', async () => {
    const id = new Types.ObjectId().toString();
    const exec = jest.fn().mockResolvedValue({ _id: id });
    equipmentModel.findByIdAndDelete.mockReturnValueOnce({ exec });

    await service.remove(id);

    expect(equipmentModel.findByIdAndDelete).toHaveBeenCalledWith(id);
  });
});