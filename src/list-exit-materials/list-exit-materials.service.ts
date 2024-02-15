import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateDetailsMaterialsDto, CreateListExitMaterialDto } from './dto/create-list-exit-material.dto';
import { UpdateDetailsMaterialsDto, UpdateListExitMaterialDto } from './dto/update-list-exit-material.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListExitMaterial } from './entities/list-exit-material.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DetailsListMaterials } from './entities/details-list-material.entity';
import { Material } from 'src/materials/entities/material.entity';

@Injectable()
export class ListExitMaterialsService {

  private readonly logger = new Logger('MaterialsService')

  constructor(   
    @InjectRepository( ListExitMaterial)
    private readonly listExitMaterialRepository: Repository<ListExitMaterial>,
    @InjectRepository( Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository( DetailsListMaterials)
    private readonly detailsMaterialsRepository: Repository<DetailsListMaterials>,
   

  ){}


  async create(createMaterialDto: CreateListExitMaterialDto, details: CreateDetailsMaterialsDto[], user: User) {
    try {
        const existingMaterial = await this.listExitMaterialRepository.createQueryBuilder()
            .where('(nameList = :nameList) AND warehouseId = :warehouseId', {
                nameList: createMaterialDto.nameList,
                warehouseId: user.warehouses[0].id
            })
            .getOne();

        if (existingMaterial) {
            throw new BadRequestException(`La lista ${createMaterialDto.nameList} ya existe en la bodega ${user.warehouses[0].name}.`);
        }

        const list = new ListExitMaterial();
        list.nameList = createMaterialDto.nameList;
        list.user = user;
        list.warehouse = user.warehouses[0];

        const savedList = await this.listExitMaterialRepository.save(list);

        const detailsWithMaterials = [];
        for (const detail of details) {
          const material = await this. materialRepository.findOne({ where: { id: detail.materialId } });

            const detailEntity = new DetailsListMaterials();
            detailEntity.material = material;
            detailEntity.list = savedList;
            detailsWithMaterials.push(detailEntity);
        }

        const savedDetails = await this.detailsMaterialsRepository.save(detailsWithMaterials);

        // Devolver los detalles asociados guardados correctamente
        return savedDetails;

    } catch (error) {
        this.handleDBExeptions(error);
    }
}

 

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let materialsQuery = this.listExitMaterialRepository.createQueryBuilder('listMaterials')
      .leftJoinAndSelect('listMaterials.user', 'user')
      .leftJoinAndSelect('listMaterials.details', 'details')
      .leftJoinAndSelect('details.material', 'material')
      .leftJoinAndSelect('listMaterials.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      materialsQuery = materialsQuery
      //  .andWhere('user.id = :userId', { userId: user.id })
       .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir los materiales eliminados
      materialsQuery = materialsQuery.andWhere('listMaterials.deletedAt IS NULL');
  
    const materials = await materialsQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return materials
  }

  async findOne(id: string,user: User) {
    const materialAssignment = await this.listExitMaterialRepository.findOne({
      where: {id: id},     
        relations: [ 'details']      
    });
  
    if (!materialAssignment) {
      throw new NotFoundException(`Asignación de material con ID ${id} no encontrada.`);
    }  
    return materialAssignment;
  }

  async update(id: string, updateListExitMaterialDto: UpdateListExitMaterialDto, details: UpdateDetailsMaterialsDto[], user: User) {
    try {
      // Buscar la lista de materiales por su ID
      const listExitMaterial = await this.listExitMaterialRepository.findOne({
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
      this.listExitMaterialRepository.merge(listExitMaterial, updateListExitMaterialDto);
  
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
      const updatedListExitMaterial = await this.listExitMaterialRepository.save(listExitMaterial);
  
      return updatedListExitMaterial;
    } catch (error) {
      // Manejar las excepciones de la base de datos
      this.handleDBExeptions(error);
    }
  }
  
  async remove(id: string, user: User) {

    const listMaterials = await this.listExitMaterialRepository.findOneBy({id: id});

    if (listMaterials) {
      listMaterials.deletedBy = user.id;
      listMaterials.deletedAt = new Date();  
      await this.listExitMaterialRepository.save(listMaterials);
    }else{
      throw new NotFoundException(`La lista de materiales de salida no fue encontrada.`);
  }

  // await this.listExitMaterialRepository.delete({id});
    
    return {message:'Material eliminado.'}
  
}


private handleDBExeptions(error: any){    

  if (error.code === 'ER_DUP_ENTRY') {
    throw new BadRequestException('El código o material ya existe.');
  }

     this.logger.error(error);
          
    throw new InternalServerErrorException('Unexpected error, check server logs');
}


}
