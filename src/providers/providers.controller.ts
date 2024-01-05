import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('providers')
export class ProvidersController {

  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @Auth()
  create(
    @Body() createProviderDto: CreateProviderDto,
    @GetUser() user: User,
    ) {
    return this.providersService.create(createProviderDto, user);
  }

  @Post('upload-excel')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async createxls(@UploadedFile() file: Express.Multer.File, createProviderDto: CreateProviderDto, 
  @GetUser() user: User) {
    return this.providersService.createxls(createProviderDto, user, file.buffer);
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user:User
  ) {
    return this.providersService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.providersService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, 
  @Body() updateProviderDto: UpdateProviderDto,
  @GetUser() user:User
  ) {
    return this.providersService.update(id, updateProviderDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id',ParseUUIDPipe) id: string,
  @GetUser() user:User
  ) {
    return this.providersService.remove(id, user);
  }
}
