import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @Auth()
  create(@Body() createContractDto: CreateContractDto,
  @GetUser() user: User,
  ) {
    return this.contractService.create(createContractDto, user);
  }

  @Post('post-service')
  @Auth()
  createPostService(@Body() createContractDto: CreateContractDto,
  @GetUser() user: User,
  ) {
    return this.contractService.createPostService(createContractDto, user);
  }

  @Post('upload-excel')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async createxls(@UploadedFile() file: Express.Multer.File, createContractDto: CreateContractDto, 
  @GetUser() user: User) {
    return this.contractService.createxls( file.buffer,  createContractDto, user,);
  }

  @Post('upload-excel-post-service')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async createxlsPostService(@UploadedFile() file: Express.Multer.File, createContractDto: CreateContractDto, 
  @GetUser() user: User) {
    return this.contractService.createxlsPostService( file.buffer,  createContractDto, user,);
  }


  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User,
  ) {
    return this.contractService.findAll(paginationDto, user);
  }

  @Get('post-service')
  @Auth()
  findAllPostService(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User,
  ) {
    return this.contractService.findAllPostService(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.contractService.findOne(term, user);
  }

  @Get('search/:term')
  @Auth()
  searchContract(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.contractService.searchContract(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto,
  @GetUser() user: User,) {
    return this.contractService.update(id, updateContractDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string,
  @GetUser() user: User,) {
    return this.contractService.remove(id, user);
  }
}
