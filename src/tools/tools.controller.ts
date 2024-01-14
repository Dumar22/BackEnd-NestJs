import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  @Auth()
  create(
  @Body() createToolDto: CreateToolDto,
  @GetUser() user: User,
  ) {
    return this.toolsService.create(createToolDto, user);
  }

  @Post('upload-excel')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async createxls(@UploadedFile() file: Express.Multer.File, createToolDto: CreateToolDto, 
  @GetUser() user: User) {
    return this.toolsService.createxls( file.buffer,  createToolDto, user,);
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User,
  ) {
    return this.toolsService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,
  ) {
    return this.toolsService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateToolDto: UpdateToolDto,
  @GetUser() user: User,
  ) {
    return this.toolsService.update(id, updateToolDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user: User,
  ) {
    return this.toolsService.remove(id, user);
  }
}
