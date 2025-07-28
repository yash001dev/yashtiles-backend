import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { SizeService } from './size.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@Controller('size')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  // Admin: full CRUD
  @Post('admin')
  create(@Body() dto: CreateSizeDto) {
    return this.sizeService.create(dto);
  }

  @Get('admin')
  findAll() {
    return this.sizeService.findAll();
  }

  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.sizeService.findOne(id);
  }

  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSizeDto) {
    return this.sizeService.update(id, dto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.sizeService.remove(id);
  }

  @Put('admin/:id/enable')
  enable(@Param('id') id: string) {
    return this.sizeService.enable(id);
  }

  @Put('admin/:id/disable')
  disable(@Param('id') id: string) {
    return this.sizeService.disable(id);
  }

  // Public: enabled only
  @Get('public')
  findEnabled() {
    return this.sizeService.findEnabled();
  }
}
