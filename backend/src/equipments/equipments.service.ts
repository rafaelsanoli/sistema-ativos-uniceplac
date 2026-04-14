import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { FilterEquipmentDto } from './dto/filter-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentStatus } from './enums/equipment-status.enum';
import { EquipmentType } from './enums/equipment-type.enum';
import { Equipment } from './schemas/equipment.schema';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectModel(Equipment.name)
    private readonly equipmentModel: Model<Equipment>,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto) {
    const equipment = await this.equipmentModel.create({
      ...createEquipmentDto,
      acquisitionDate: new Date(createEquipmentDto.acquisitionDate),
    });

    return equipment;
  }

  async findAll(filters: FilterEquipmentDto) {
    const query: {
      type?: EquipmentType;
      status?: EquipmentStatus;
      name?: { $regex: string; $options: string };
    } = {};

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    return this.equipmentModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    this.ensureObjectId(id);
    const equipment = await this.equipmentModel.findById(id).exec();

    if (!equipment) {
      throw new NotFoundException('Equipamento nao encontrado.');
    }

    return equipment;
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto) {
    this.ensureObjectId(id);

    const payload = {
      ...updateEquipmentDto,
      ...(updateEquipmentDto.acquisitionDate
        ? { acquisitionDate: new Date(updateEquipmentDto.acquisitionDate) }
        : {}),
    };

    const equipment = await this.equipmentModel
      .findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!equipment) {
      throw new NotFoundException('Equipamento nao encontrado.');
    }

    return equipment;
  }

  async remove(id: string) {
    this.ensureObjectId(id);
    const deleted = await this.equipmentModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('Equipamento nao encontrado.');
    }
  }

  private ensureObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Equipamento nao encontrado.');
    }
  }
}
