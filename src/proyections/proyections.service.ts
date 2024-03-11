import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDetailsProyectionDto, CreateProyectionDto } from './dto/create-proyection.dto';
import { UpdateDetailsProyectionDto, UpdateProyectionDto } from './dto/update-proyection.dto';
import { Proyect } from 'src/proyects/entities/proyect.entity';
import { Repository } from 'typeorm';
import { DetailsProyection } from './entities/details-proyection.entity';
import { Proyection } from './entities/proyection.entity';
import { Material } from 'src/materials/entities/material.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProyectionsService {

  private readonly logger = new Logger('EntriesService')

  constructor(   
    @InjectRepository( Proyection)
    private readonly proyectionRepository: Repository<Proyection>,     
    @InjectRepository( DetailsProyection)
    private readonly detailsProyectionRepository: Repository<DetailsProyection>,
    @InjectRepository( Proyect)
    private readonly proyectRepository: Repository<Proyect>,
  ){}

  async create(createProyectDto: CreateProyectionDto, createDetailProyectionDto: CreateDetailsProyectionDto[], user: User) {
    // Verificar si ya existe una entrada con el mismo número en la misma bodega
    
    try {
      // Crear la entrada
      const proyection = await this.proyectionRepository.create({
        ...createProyectDto,       
        details: createDetailProyectionDto
      });

    

      // Guardar la entrada en la base de datos
      const savedEntry = await this.proyectionRepository.save(proyection,);

      // Crear los detalles de materiales y asociarlos a la entrada
      const materialDetails = createDetailProyectionDto.map((materialDetail) => {
        const materialEntry = this.detailsProyectionRepository.create({
          ...materialDetail,
          proyection: savedEntry, // Asociar el detalle a la entrada recién creada
        });
        return materialEntry;
      });

      // Guardar los detalles de materiales en la base de datos
      await this.detailsProyectionRepository.save(materialDetails);          

      return { entry: savedEntry, message: 'Entrada creada' };
    } catch (error) {
      //console.log(error);      
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);
    }
  }  

  async findAll(paginationDto: PaginationDto, user: User) {
    // const { limit = 10, offset = 0 } = paginationDto;
  
    let proyectionsQuery = this.proyectionRepository.createQueryBuilder('proyection')
      .leftJoinAndSelect('proyection.proyect', 'proyect')
      .leftJoinAndSelect('proyection.details', 'details')
      .leftJoinAndSelect('proyection.user', 'user')
      .leftJoinAndSelect('proyection.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      proyectionsQuery = proyectionsQuery
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las erramientas eliminados
      proyectionsQuery = proyectionsQuery.andWhere('entry.deletedAt IS NULL');
  
    const entries = await proyectionsQuery
      // .skip(offset)
      // .take(limit)
      .getMany();
  
    return entries
  }

  async findOne(term: string, user: User) {
    let proyection: Proyection;
  
    if (isUUID(term)) {
      proyection = await this.proyectionRepository.findOne({
        where: [{id: term}],
          relations: ['proyect','details'],
         });
    }

    if (!proyection) {
      throw new NotFoundException(`La entrada no fue encontrada.`);
    }
  
    return proyection;
  }

  /* async searchEntry(term: string, user: User) {
    let data = await this.proyectRepository.find({
      where: [
        { entryNumber: Like(`%${term}%`) },
        { providerName: Like(`%${term}%`) },
        { origin: Like(`%${term}%`) },
        
      ],
    });
    return data;
  } */
  
  async update(id: string, updateProyectionDto: UpdateProyectionDto, updateDetailProyectionDto: UpdateDetailsProyectionDto[], user: User) {

    const existingEntry = await this.proyectionRepository.findOneBy({id: id});
  
    if (!existingEntry) 
      throw new NotFoundException(`Entrada con ID ${id} no encontrada.`);   
           
  
    // Actualizar la entrada con los datos proporcionados en updateEntryDto
    this.proyectionRepository.merge(existingEntry, updateProyectionDto);  
  
    // Actualizar los detalles de la entrada
    const updatedDetails = updateProyectionDto.details.map(updateDetail => {
      const existingDetail = existingEntry.details.find(detail => detail.id === updateDetail.id);
      
      if (existingDetail) {
        // El detalle existe, por lo que se actualiza
        this.detailsProyectionRepository.merge(existingDetail, updateDetail);
        return existingDetail;
      } else {
        // El detalle no existe, por lo que se crea como un nuevo detalle
        const newDetail = this.detailsProyectionRepository.create(updateDetail);
        existingEntry.details.push(newDetail);
        return newDetail;
      }
    });
    

  try {
    
    
    // Guardar los cambios en la base de datos
    await this.proyectionRepository.save(existingEntry);
    await this.detailsProyectionRepository.save(updatedDetails);   
  
    return { entry: existingEntry, message: 'Entrada actualizada con éxito.' };
  } catch (error) {
     // Manejar las excepciones de la base de datos
     this.handleDBExceptions(error);
  }
  }

  async remove(id: string, user: User) {

    const proyection = await this.proyectionRepository.findOneBy({id: id});

  if (proyection) {
   proyection.deletedBy = user.id;
   proyection.deletedAt = new Date();
   

    await this.proyectionRepository.save(proyection);
    
    return {message:'Entrada eliminada.'}
  }else{
    throw new NotFoundException(`La proyección no fue encontrada.`);
  }
}

private handleDBExceptions(error: any){    

  if (error.code === 'ER_DUP_ENTRY') {
    throw new BadRequestException('La proyección ya existe.');
  }

  if (error instanceof Error) {
    // Capturar y manejar errores específicos lanzados con el mensaje deseado
   // console.error(error.message);
    throw new BadRequestException(error.message);
  }

     this.logger.error(error);
          
    throw new InternalServerErrorException('Unexpected error, check server logs');
}

}
