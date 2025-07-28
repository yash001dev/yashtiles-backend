import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  // Admin: full CRUD
  @Post('admin')
  create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @Get('admin')
  findAll() {
    return this.materialService.findAll();
  }

  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(id, dto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.materialService.remove(id);
  }

  @Put('admin/:id/enable')
  enable(@Param('id') id: string) {
    return this.materialService.enable(id);
  }

  @Put('admin/:id/disable')
  disable(@Param('id') id: string) {
    return this.materialService.disable(id);
  }

  // Public: enabled only
  @Get('public')
  findEnabled() {
    return this.materialService.findEnabled();
  }
}
