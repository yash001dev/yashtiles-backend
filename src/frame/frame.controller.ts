import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { FrameService } from './frame.service';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';

@Controller('frame')
export class FrameController {
  constructor(private readonly frameService: FrameService) {}

  // Admin: full CRUD
  @Post('admin')
  create(@Body() dto: CreateFrameDto) {
    return this.frameService.create(dto);
  }

  @Get('admin')
  findAll() {
    return this.frameService.findAll();
  }

  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.frameService.findOne(id);
  }

  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFrameDto) {
    return this.frameService.update(id, dto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.frameService.remove(id);
  }

  @Put('admin/:id/enable')
  enable(@Param('id') id: string) {
    return this.frameService.enable(id);
  }

  @Put('admin/:id/disable')
  disable(@Param('id') id: string) {
    return this.frameService.disable(id);
  }

  // Public: enabled only
  @Get('public')
  findEnabled() {
    return this.frameService.findEnabled();
  }
}
