import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Frame } from './frame.schema';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';

@Injectable()
export class FrameService {
  constructor(@InjectModel(Frame.name) private frameModel: Model<Frame>) {}

  async create(dto: CreateFrameDto) {
    return this.frameModel.create(dto);
  }

  async findAll() {
    return this.frameModel.find().exec();
  }

  async findEnabled() {
    return this.frameModel.find({ enabled: true }).exec();
  }

  async findOne(id: string) {
    return this.frameModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateFrameDto) {
    return this.frameModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.frameModel.findByIdAndDelete(id).exec();
  }

  async enable(id: string) {
    return this.frameModel.findByIdAndUpdate(id, { enabled: true }, { new: true }).exec();
  }

  async disable(id: string) {
    return this.frameModel.findByIdAndUpdate(id, { enabled: false }, { new: true }).exec();
  }
}
