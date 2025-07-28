import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { HangTypeService } from './hang-type.service';
import { CreateHangTypeDto } from './dto/create-hang-type.dto';
import { UpdateHangTypeDto } from './dto/update-hang-type.dto';

@Controller('hang-type')
export class HangTypeController {
  constructor(private readonly hangTypeService: HangTypeService) {}

  // Admin: full CRUD
  @Post('admin')
  create(@Body() dto: CreateHangTypeDto) {
    return this.hangTypeService.create(dto);
  }

  @Get('admin')
  findAll() {
    return this.hangTypeService.findAll();
  }

  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.hangTypeService.findOne(id);
  }

  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateHangTypeDto) {
    return this.hangTypeService.update(id, dto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.hangTypeService.remove(id);
  }

  @Put('admin/:id/enable')
  enable(@Param('id') id: string) {
    return this.hangTypeService.enable(id);
  }

  @Put('admin/:id/disable')
  disable(@Param('id') id: string) {
    return this.hangTypeService.disable(id);
  }

  // Public: enabled only
  @Get('public')
  findEnabled() {
    return this.hangTypeService.findEnabled();
  }
}
