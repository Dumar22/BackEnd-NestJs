import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Collaborator } from './entities/collaborator.entity';
import { User } from 'src/auth/entities/user.entity';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';

@Injectable()
export class CollaboratorsService {
  private readonly logger = new Logger('CollaboratorsService')

  constructor(   
    @InjectRepository( Collaborator)
    private readonly collaboratorsRepository: Repository<Collaborator>,
    private readonly fileUploadService: FileUploadService

  ){}


  async create(createCollaboratorDto: CreateCollaboratorDto, user: User) {

    const existingCollaborator = await this.collaboratorsRepository.createQueryBuilder('collaborator')
    .where('(collaborator.name = :name OR collaborator.code = :code) AND warehouseId = :warehouseId', { 
      name: createCollaboratorDto.name, 
      code: createCollaboratorDto.code,
      warehouseId: user.warehouses[0].id  
    })
    .getOne();
  
      if (existingCollaborator) {
        throw new BadRequestException(`El colaboraor ${createCollaboratorDto.name} ya existe en la bodega ${user.warehouses[0].name}.`);
      }

    try {   

       const collaborator = this.collaboratorsRepository.create({
       ...createCollaboratorDto,
       user, 
       warehouse: user.warehouses[0]
        
      });

     await this.collaboratorsRepository.save(collaborator);

      return {message:'Colaborador creado'}
      
    } catch (error) {          
      //console.log(error); 
      this.handleDBExeptions(error)
    }   
  }


  async createxls(createCollaboratorDto: CreateCollaboratorDto, user: User, fileBuffer: Buffer) {
    try {
      // Lógica para procesar el archivo Excel y obtener la lista de colaboradores
      const collaborators = await this.fileUploadService.processExcel(fileBuffer, this.collaboratorsRepository, (entry: CreateCollaboratorDto) => {
        return this.providerDataFormat(entry, user);
      });   
        
      // Lista de colaboraores que no fueron cargados
      const failedcollaborators: { collaborators: CreateCollaboratorDto; reason: string }[] = [];
  
      for (const collaborator of collaborators) {
        const ExistingCollaborator = await this.collaboratorsRepository.createQueryBuilder('collaborator')
        .where('(collaborator.name = :name OR collaborator.code = :code) AND warehouseId = :warehouseId', {
          name: collaborator.name,  
          code: collaborator.code,
          warehouseId: user.warehouses[0].id  
        })
    .getOne();
          
    if (ExistingCollaborator) {
      failedcollaborators.push({ 
        collaborators: collaborator, 
        reason: `El Colaborador ${collaborator.name} ya existe en la bodega ${user.warehouses[0].name}.` 
      });    
    } else {    
      // Guardar el proveedor solo si no existe
      await this.collaboratorsRepository.save(collaborator);     
    }
      }
  
      return { collaborators: collaborators, failedProviders: failedcollaborators, message: 'Colaboradores creados' };
    } catch (error) {
      console.log(error);
      this.handleDBExeptions(error);
    }
  }
  
  
  private providerDataFormat(entry: CreateCollaboratorDto, user: User): Collaborator {
    return this.collaboratorsRepository.create({
      ...entry,
      user,
      warehouse: user.warehouses[0],
    });
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    // const { limit = 10, offset = 0 } = paginationDto;
  
    let colaboratorsQuery = this.collaboratorsRepository.createQueryBuilder('collaborator')
      .leftJoinAndSelect('collaborator.user', 'user')
      .leftJoinAndSelect('collaborator.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      colaboratorsQuery = colaboratorsQuery
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir los materiales eliminados
      colaboratorsQuery = colaboratorsQuery.andWhere('collaborator.deletedAt IS NULL');
  
    const collaborators = await colaboratorsQuery
      // .skip(offset)
      // .take(limit)
      .getMany();
  
    return collaborators
  }

 async findOne(term: string, user: User) {
   
   let collaborator: Collaborator;
     if (isUUID(term)) {
      collaborator = await this.collaboratorsRepository.findOneBy({id: term});
     }else{
      //material = await this.materialsRepository.findOneBy({name: term});
      const queryBuilder = this.collaboratorsRepository.createQueryBuilder();
      collaborator = await queryBuilder
       .where('UPPER(name) =:name or code =:code',{
        name: term.toUpperCase(),
        code: term.toLowerCase(),
       }).getOne();
    }    
    if (!collaborator)
      throw new NotFoundException(`El colaborador no fue encontrado.`);

      return collaborator;
  }  
  

  async searchCollaborator(term: string, user: User) {
    let data = await this.collaboratorsRepository.find({
      where: [
        { name: Like(`%${term}%`) },
        { code: Like(`%${term}%`) },
        { operation: Like(`%${term}%`) },
      ],
    });
    return data;
  }

 async update(id: string, updateCollaboratorDto: UpdateCollaboratorDto, user: User) {
    
    const collaborator = await this.collaboratorsRepository.preload({
      id: id,
      ...updateCollaboratorDto
    });
      
    const existingCollaborator = await this.collaboratorsRepository.createQueryBuilder('collaborator')
    .where('(LOWER(collaborator.name) = LOWER(:name) OR collaborator.code = :code) AND collaborator.warehouseId = :warehouseId', {
      name: updateCollaboratorDto.name,
      code: updateCollaboratorDto.code,
      warehouseId: user.warehouses[0].id
    })
    .andWhere('collaborator.id != :collaboratorId', { collaboratorId: id })
    .getOne();

  if (existingCollaborator && (existingCollaborator.name !== collaborator.name || existingCollaborator.code !== collaborator.code)) {
    throw new BadRequestException(`El colaborador ${updateCollaboratorDto.name} ya existe en la bodega ${user.warehouses[0].name}.`);
  }

      
        try {
          await this.collaboratorsRepository.save(collaborator);
          return {Message:'Colaborardor actualizado con exito'};
   
        } catch (error) {
          this.handleDBExeptions(error)
        }
  }

  async remove(id: string, user: User) {

    const collaborator = await this.collaboratorsRepository.findOneBy({id: id});

  if (collaborator) {
    collaborator.deletedBy = user.id;
    collaborator.deletedAt = new Date();

    await this.collaboratorsRepository.save(collaborator);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Colaborador eliminado.'}
  }else{
    throw new NotFoundException(`El Colaborador no fue encontrado.`);
  }
}

  private handleDBExeptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('El código o documento ya existe.');
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
