import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material } from './material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialService {
  constructor(@InjectModel(Material.name) private materialModel: Model<Material>) {}

  async create(dto: CreateMaterialDto) {
    return this.materialModel.create(dto);
  }

  async findAll() {
    return this.materialModel.find().exec();
  }

  async findEnabled() {
    return this.materialModel.find({ enabled: true }).exec();
  }

  async findOne(id: string) {
    return this.materialModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateMaterialDto) {
    return this.materialModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.materialModel.findByIdAndDelete(id).exec();
  }

  async enable(id: string) {
    return this.materialModel.findByIdAndUpdate(id, { enabled: true }, { new: true }).exec();
  }

  async disable(id: string) {
    return this.materialModel.findByIdAndUpdate(id, { enabled: false }, { new: true }).exec();
  }
}
