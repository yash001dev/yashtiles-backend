import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HangType } from './hang-type.schema';
import { CreateHangTypeDto } from './dto/create-hang-type.dto';
import { UpdateHangTypeDto } from './dto/update-hang-type.dto';

@Injectable()
export class HangTypeService {
  constructor(@InjectModel(HangType.name) private hangTypeModel: Model<HangType>) {}

  async create(dto: CreateHangTypeDto) {
    return this.hangTypeModel.create(dto);
  }

  async findAll() {
    return this.hangTypeModel.find().exec();
  }

  async findEnabled() {
    return this.hangTypeModel.find({ enabled: true }).exec();
  }

  async findOne(id: string) {
    return this.hangTypeModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateHangTypeDto) {
    return this.hangTypeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.hangTypeModel.findByIdAndDelete(id).exec();
  }

  async enable(id: string) {
    return this.hangTypeModel.findByIdAndUpdate(id, { enabled: true }, { new: true }).exec();
  }

  async disable(id: string) {
    return this.hangTypeModel.findByIdAndUpdate(id, { enabled: false }, { new: true }).exec();
  }
}
