import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProyectDto } from './dto/create-proyect.dto';
import { UpdateProyectDto } from './dto/update-proyect.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proyect } from './entities/proyect.entity';
import { Like, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { User } from 'src/auth/entities/user.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class ProyectsService {

  private readonly logger = new Logger('ProyectsService')

  constructor(   
    @InjectRepository( Proyect)
    private readonly proyectsRepository: Repository<Proyect>,
    

  ){}

  async create(createProyectDto: CreateProyectDto, user: User) {

    const existingProyect = await this.proyectsRepository.createQueryBuilder('proyect')
    .where('proyect.name = :name  AND warehouseId = :warehouseId', { 
      name: createProyectDto.name,       
      warehouseId: user.warehouses[0].id  
    })
    .getOne();
  
      if (existingProyect) {
        throw new BadRequestException(`El Proyecto ${createProyectDto.name} ya existe en la bodega ${user.warehouses[0].name}.`);
      }

    try {   

       const proyect = this.proyectsRepository.create({
       ...createProyectDto,
       user, 
       warehouse: user.warehouses[0]
        
      });

     await this.proyectsRepository.save(proyect);

      return {proyect: proyect, message:'Proyecto creado'}
      
    } catch (error) {          
      //console.log(error); 
      this.handleDBExeptions(error)
    }
   

  }

  async findAll(paginationDto: PaginationDto, user: User) {
    // const { limit = 10, offset = 0 } = paginationDto;
  
    let proyectsQuery = this.proyectsRepository.createQueryBuilder('proyect')
      .leftJoinAndSelect('proyect.user', 'user')
      .leftJoinAndSelect('proyect.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      proyectsQuery = proyectsQuery
        // .andWhere('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir los proveedores eliminados
      proyectsQuery = proyectsQuery.andWhere('proyect.deletedAt IS NULL');
  
    const proyects = await proyectsQuery
      // .skip(offset)
      // .take(limit)
      .getMany();
  
    return proyects
  }

 async findOne(term: string, user: User) {
   
   let proyect: Proyect;
     if (isUUID(term)) {
      proyect = await this.proyectsRepository.findOneBy({id: term});
     }else{
      //material = await this.materialsRepository.findOneBy({name: term});
      const queryBuilder = this.proyectsRepository.createQueryBuilder();
      proyect = await queryBuilder
       .where('UPPER(name) =:name',{
        name: term.toUpperCase(),
       }).getOne();
    }    
    if (!proyect)
      throw new NotFoundException(`El Proyecto no fue encontrado.`);

      return proyect;
  }  

  async searchProyect(term: string, user: User) {
    let data = await this.proyectsRepository.find({
      where: [
        { name: Like(`%${term}%`) },
       
      ],
    });
    return data;
  }
  
 async update(id: string, updateProyectDto: UpdateProyectDto, user: User) {
    
    const proyect = await this.proyectsRepository.preload({
      id: id,
      ...updateProyectDto
    });
      
    const existingProyect = await this.proyectsRepository.createQueryBuilder('proyect')
    .where('(LOWER(proyect.name) = LOWER(:name) ) AND proyect.warehouseId = :warehouseId', {
      name: updateProyectDto.name,      
      warehouseId: user.warehouses[0].id
    })
    .andWhere('proyect.id != :proyectId', { proyectId: id })
    .getOne();

  if (existingProyect && (existingProyect.name !== proyect.name)) {
    throw new BadRequestException(`El Proveedor ${updateProyectDto.name}  ya existe en la bodega ${user.warehouses[0].name}.`);
  }

      
        try {
          await this.proyectsRepository.save(proyect);
          return proyect;
   
        } catch (error) {
          this.handleDBExeptions(error)
        }
  }

  async remove(id: string, user: User) {

    const proyect = await this.proyectsRepository.findOneBy({id: id});

  if (proyect) {
    proyect.deletedBy = user.id;
    proyect.deletedAt = new Date();

    await this.proyectsRepository.save(proyect);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Proyecto eliminado.'}
  }else{
    throw new NotFoundException(`El proyecto no fue encontrado.`);
  }
}

  private handleDBExeptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('El código o proveedor ya existe.');
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
  
  
}
