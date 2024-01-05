import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post()
  @Auth()
  create(
    @Body() createCollaboratorDto: CreateCollaboratorDto,
    @GetUser() user: User,
    ) {
    return this.collaboratorsService.create(createCollaboratorDto, user);
  }


  @Post('upload-excel')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async createxls(@UploadedFile() file: Express.Multer.File, createCollaboratorDto: CreateCollaboratorDto, 
  @GetUser() user: User) {
    return this.collaboratorsService.createxls(createCollaboratorDto, user, file.buffer);
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user:User
  ) {
    return this.collaboratorsService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.collaboratorsService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateCollaboratorDto: UpdateCollaboratorDto,
  @GetUser() user:User) {
    return this.collaboratorsService.update(id, updateCollaboratorDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id',ParseUUIDPipe) id: string,
  @GetUser() user:User
  ) {
    return this.collaboratorsService.remove(id, user);
  }
}
