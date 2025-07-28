import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Frame, FrameSchema } from './frame.schema';
import { FrameService } from './frame.service';
import { FrameController } from './frame.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Frame.name, schema: FrameSchema }])],
  providers: [FrameService],
  controllers: [FrameController],
  exports: [FrameService],
})
export class FrameModule {}
