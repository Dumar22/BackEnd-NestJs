import { Injectable } from '@nestjs/common';
import { CreateProyectionDto } from './dto/create-proyection.dto';
import { UpdateProyectionDto } from './dto/update-proyection.dto';

@Injectable()
export class ProyectionsService {
  create(createProyectionDto: CreateProyectionDto) {
    return 'This action adds a new proyection';
  }

  findAll() {
    return `This action returns all proyections`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proyection`;
  }

  update(id: number, updateProyectionDto: UpdateProyectionDto) {
    return `This action updates a #${id} proyection`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyection`;
  }
}
