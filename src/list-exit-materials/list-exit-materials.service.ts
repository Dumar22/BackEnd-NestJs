import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateDetailsMaterialsDto, CreateListExitMaterialDto } from './dto/create-list-exit-material.dto';
import { UpdateDetailsMaterialsDto, UpdateListExitMaterialDto } from './dto/update-list-exit-material.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListExitMaterial } from './entities/list-exit-material.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DetailsListMaterials } from './entities/details-list-material.entity';

@Injectable()
export class ListExitMaterialsService {

  private readonly logger = new Logger('MaterialsService')

  constructor(   
    @InjectRepository( ListExitMaterial)
    private readonly materialsRepository: Repository<ListExitMaterial>,
    @InjectRepository( DetailsListMaterials)
    private readonly detailsMaterialsRepository: Repository<DetailsListMaterials>,
   

  ){}


  async create(createMaterialDto: CreateListExitMaterialDto,details:CreateDetailsMaterialsDto[], user: User) {

    const existingMaterial = await this.materialsRepository.createQueryBuilder()
    .where('(nameList = :nameList OR code = :code) AND warehouseId = :warehouseId', { 
      name: createMaterialDto.nameList,      
      warehouseId: user.warehouses[0].id  
    })
    .getOne();
  
      if (existingMaterial) {
        throw new BadRequestException(`La lista ${createMaterialDto.nameList} ya existe en la bodega ${user.warehouses[0].name}.`);
      }

    try {   

       const material = this.materialsRepository.create({
       ...createMaterialDto,
       user, 
       details,
       warehouse: user.warehouses[0]
        
      });


      const detailsWithMaterials = [];
      for (const detail of details) {
      
        const material = await this.materialsRepository.findOneBy({id:detail.materialId});
      
        detailsWithMaterials.push({
          ...detail,
          material
        });  
      } 
      //console.log(detailsWithMaterials);  
      
      const savedMaterial = await this.materialsRepository.save(material);
      
      const detailMaterials = [];
    
    for (const detail of detailsWithMaterials) {
      detailMaterials.push(
        this.detailsMaterialsRepository.create({
          ...detail,
          list: savedMaterial
        })
      );
    }
      //console.log('data save',detailAssignments);
      
      await this.detailsMaterialsRepository.save(detailMaterials);
        
        
            // Devolver la asignación completa con los detalles asociados
            return detailMaterials
        
            
          } catch (error) {
           // console.log('created',error);
            
            // Manejar las excepciones de la base de datos
            this.handleDBExeptions(error);
      
          }
       }
    
 

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let materialsQuery = this.materialsRepository.createQueryBuilder('material')
      .leftJoinAndSelect('material.user', 'user')
      .leftJoinAndSelect('material.details', 'details')
      .leftJoinAndSelect('details.material', 'material')
      .leftJoinAndSelect('material.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      materialsQuery = materialsQuery
      //  .andWhere('user.id = :userId', { userId: user.id })
       .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir los materiales eliminados
      materialsQuery = materialsQuery.andWhere('material.deletedAt IS NULL');
  
    const materials = await materialsQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return materials
  }

  async findOne(id: string,user: User) {
    const materialAssignment = await this.materialsRepository.findOne({
      where: {id: id},     
        relations: [ 'details.material']      
    });
  
    if (!materialAssignment) {
      throw new NotFoundException(`Asignación de material con ID ${id} no encontrada.`);
    }  
    return materialAssignment;
  }

  async update(id: string, updateListExitMaterialDto: UpdateListExitMaterialDto, details: UpdateDetailsMaterialsDto[], user: User) {
    try {
      // Buscar la lista de materiales por su ID
      const listExitMaterial = await this.materialsRepository.findOne({
        where: { id: id },
         relations: ['details'] });
  
      if (!listExitMaterial) {
        throw new NotFoundException(`La lista de materiales con el ID ${id} no fue encontrada.`);
      }
  
      // Verificar si el usuario tiene permiso para actualizar la lista de materiales
      // if (listExitMaterial.user.id !== user.id) {
      //   throw new UnauthorizedException('No tienes permiso para actualizar esta lista de materiales.');
      // }
  
      // Actualizar los campos de la lista de materiales
      this.materialsRepository.merge(listExitMaterial, updateListExitMaterialDto);
  
      // Actualizar los detalles de los materiales
      if (details && details.length > 0) {
        // Eliminar los detalles de materiales existentes
        await this.detailsMaterialsRepository.delete({list: details });
  
        // Crear y asociar los nuevos detalles de materiales
        const newDetails = details.map(detail => {
          const newDetail = this.detailsMaterialsRepository.create({
            ...detail,
            list: listExitMaterial
          });
          return newDetail;
        });
  
        await this.detailsMaterialsRepository.save(newDetails);
      }
  
      // Guardar la lista de materiales actualizada
      const updatedListExitMaterial = await this.materialsRepository.save(listExitMaterial);
  
      return updatedListExitMaterial;
    } catch (error) {
      // Manejar las excepciones de la base de datos
      this.handleDBExeptions(error);
    }
  }
  
  async remove(id: string, user: User) {

    const material = await this.materialsRepository.findOneBy({id: id});

  if (material) {
    // material.code = material.code+'XX'
    // material.deletedBy = user.id;
    // material.deletedAt = new Date();

    await this.materialsRepository.remove(material);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Material eliminado.'}
  }else{
    throw new NotFoundException(`El material no fue encontrado.`);
  }
}


private handleDBExeptions(error: any){    

  if (error.code === 'ER_DUP_ENTRY') {
    throw new BadRequestException('El código o material ya existe.');
  }

     this.logger.error(error);
          
    throw new InternalServerErrorException('Unexpected error, check server logs');
}


}
