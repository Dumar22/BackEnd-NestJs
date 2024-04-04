import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MetersService } from './meters.service';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser } from 'src/auth/decorators';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidRols } from 'src/auth/interfaces/valid-rols';

@Controller('meters')
export class MetersController {
  constructor(private readonly metersService: MetersService) {}

  @Post()
  @Auth()
  create(
    @Body() createMeterDto: CreateMeterDto,
    @GetUser() user: User,
    ) {
    return this.metersService.create(createMeterDto, user);
  }

  @Post('upload-excel')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async createxls(@UploadedFile() file: Express.Multer.File, createMeterDto: CreateMeterDto, 
  @GetUser() user: User) {
    return this.metersService.createxls( file.buffer,  createMeterDto, user,);
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User,

  ) {
    return this.metersService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,
  ) {
    return this.metersService.findOne(term,user);
  }

  @Get('search/:term')
  @Auth()
  searchMeter(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.metersService.searchMeter(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, 
  @Body() updateMeterDto: UpdateMeterDto,
  @GetUser() user: User,
  ) {
    return this.metersService.update(id, updateMeterDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user: User,) {
    return this.metersService.remove(id,user);
  }
}
