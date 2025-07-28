import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Size } from './size.schema';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@Injectable()
export class SizeService {
  constructor(@InjectModel(Size.name) private sizeModel: Model<Size>) {}

  async create(dto: CreateSizeDto) {
    return this.sizeModel.create(dto);
  }

  async findAll() {
    return this.sizeModel.find().exec();
  }

  async findEnabled() {
    return this.sizeModel.find({ enabled: true }).exec();
  }

  async findOne(id: string) {
    return this.sizeModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateSizeDto) {
    return this.sizeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.sizeModel.findByIdAndDelete(id).exec();
  }

  async enable(id: string) {
    return this.sizeModel.findByIdAndUpdate(id, { enabled: true }, { new: true }).exec();
  }

  async disable(id: string) {
    return this.sizeModel.findByIdAndUpdate(id, { enabled: false }, { new: true }).exec();
  }
}
