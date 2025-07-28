import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HangType, HangTypeSchema } from './hang-type.schema';
import { HangTypeService } from './hang-type.service';
import { HangTypeController } from './hang-type.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: HangType.name, schema: HangTypeSchema }])],
  providers: [HangTypeService],
  controllers: [HangTypeController],
  exports: [HangTypeService],
})
export class HangTypeModule {}
