import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Size, SizeSchema } from './size.schema';
import { SizeService } from './size.service';
import { SizeController } from './size.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Size.name, schema: SizeSchema }])],
  providers: [SizeService],
  controllers: [SizeController],
  exports: [SizeService],
})
export class SizeModule {}
