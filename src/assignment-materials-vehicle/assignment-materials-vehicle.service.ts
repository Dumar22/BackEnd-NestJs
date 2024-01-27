import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateAssignmentMaterialsVehicleDto } from './dto/create-assignment-materials-vehicle.dto';
import { UpdateAssignmentMaterialsVehicleDto } from './dto/update-assignment-materials-vehicle.dto';
import { CreateAssignmentDetailsMaterialsVehicleDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from 'src/materials/entities/material.entity';
import { AssignmentDetailsMaterialsVehicle, AssignmentMaterialsVehicle } from './entities';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

@Injectable()
export class AssignmentMaterialsVehicleService {

  private readonly logger = new Logger('AssignmentMaterialsVehicleService')

  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(AssignmentMaterialsVehicle)
    private readonly materialAssignmentRepository: Repository<AssignmentMaterialsVehicle>,
    @InjectRepository(AssignmentDetailsMaterialsVehicle)
    private readonly materialAssignmentDetailRepository: Repository<AssignmentDetailsMaterialsVehicle>,
  ) {}


  async create(createAssignmentMaterialsVehicleDto: CreateAssignmentMaterialsVehicleDto, details: CreateAssignmentDetailsMaterialsVehicleDto[], user: User) {
  
    
      const { collaboratorId, vehicleId,...rest } = createAssignmentMaterialsVehicleDto;   
      
      //console.log(createToolAssignmentDTO);
      
      // Buscar el colaborador en la base de datos
      const collaborator = await this.collaboratorRepository.findOne({
        where:{id:collaboratorId},
        relations:['warehouse']
      });
  
      if (!collaborator) {
        throw new NotFoundException('Colaborador no encontrado');
      }
// Buscar el vehículo en la base de datos
      const vehicle = await this.vehicleRepository.findOne({
        where:{id:vehicleId},
        relations:['warehouse']
      });
  
      if (!vehicle) {
        throw new NotFoundException('Vehiculo no encontrado');
      }   
      
      const ware= collaborator.warehouse.id              
     
     try {   
       // Creamos la instancia de ToolAssignment sin los detalles
   const newMaterialAssignment = await this.materialAssignmentRepository.create({
    ...rest,
    user,
    collaborator,
    vehicle,
    details: details,
    warehouse: user.warehouses[0]
  });                
        //console.log(newMaterialAssignment);
        
        // Verificar si todas las herramientas existen y 
      // Actualiza la cantidad de herramientas en el inventario
     await this.verifyMaterialsExistence(details, ware);    
    
        // Guardar la asignación en la base de datos      
        
        const detailsWithMaterials = [];
  for (const detail of details) {
  
    const material = await this.materialRepository.findOneBy({id:detail.materialId});
  
    detailsWithMaterials.push({
      ...detail,
      material
    });  
  } 
  //console.log(detailsWithMaterials);  
  
  const savedMaterialAssignment = await this.materialAssignmentRepository.save(newMaterialAssignment);
  
  const detailAssignments = [];

for (const detail of detailsWithMaterials) {
  detailAssignments.push(
    this.materialAssignmentDetailRepository.create({
      ...detail,
      assignmentDetailsMaterialsVehicle: savedMaterialAssignment
    })
  );
}
  //console.log('data save',detailAssignments);
  
  await this.materialAssignmentDetailRepository.save(detailAssignments);
    
    
        // Devolver la asignación completa con los detalles asociados
        return detailAssignments
    
        
      } catch (error) {
       // console.log('created',error);
        
        // Manejar las excepciones de la base de datos
        this.handleDBExceptions(error);
  
      }
   }

   async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let materialAssignmentQuery = this.materialAssignmentRepository.createQueryBuilder('materialAssignment')
      .leftJoinAndSelect('materialAssignment.collaborator', 'collaborator')
      .leftJoinAndSelect('materialAssignment.vehicle', 'vehicle')
      .leftJoinAndSelect('materialAssignment.details', 'details')
      .leftJoinAndSelect('details.material', 'material')
      .leftJoinAndSelect('materialAssignment.user', 'user')
      .leftJoinAndSelect('materialAssignment.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      materialAssignmentQuery = materialAssignmentQuery
        .andWhere('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las erramientas eliminados
      materialAssignmentQuery = materialAssignmentQuery.andWhere('materialAssignment.deletedAt IS NULL');
  
    const materialassignment = await materialAssignmentQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return  materialassignment
  }

  async findOne(id: string,user: User) {
    const materialAssignment = await this.materialAssignmentRepository.findOne({
      where: {id: id},     
        relations: ['collaborator','vehicle', 'details.material']      
    });
  
    if (!materialAssignment) {
      throw new NotFoundException(`Asignación de material con ID ${id} no encontrada.`);
    }  
    return materialAssignment;
  }

  update(id: string, updateAssignmentMaterialsVehicleDto: UpdateAssignmentMaterialsVehicleDto,details: CreateAssignmentDetailsMaterialsVehicleDto[], user: User) {
    return `This action updates a #${id} assignmentMaterialsVehicle`;
  }

  async remove(id: string, user: User) {
    const materialAssignment = await this.materialAssignmentRepository.findOneBy({id: id});
  
    if (!materialAssignment) {
      throw new NotFoundException(`Asignación de material con ID ${id} no encontrada.`);
    }
  
    // // Actualizar la cantidad de herramientas después de la eliminación
    await this.materialRepository
      .createQueryBuilder()
      .update(Material)
      .set({ quantity: () => 'quantity + 1' })
      //.where('id = :toolId', { toolId: toolAssignment.tool.id })
      .execute();

      materialAssignment.deletedBy = user.id;
    materialAssignment.deletedAt = new Date();

    await this.materialAssignmentRepository.save(materialAssignment);
  
    //await this.materialAssignmentRepository.delete(id);
  
    return { message: 'Asignación de material eliminada con éxito.' };
  } 


  private async verifyMaterialsExistence(details: CreateAssignmentDetailsMaterialsVehicleDto[], warehouseId: string): Promise<void> {
    try {
      for (const detail of details) {
        const materialId = detail.materialId;
        const assignedQuantity = detail.assignedQuantity;
  
        // Buscar la herramienta en la base de datos
        const material = await this.materialRepository.findOne({
          where: { id: materialId },
          relations: ['warehouse']
        });
  
        if (!material) {
          throw new Error(`Material con ID ${materialId} no encontrado`);
        }
  
        // Verificar si la herramienta pertenece a la bodega del colaborador
        if (material.warehouse.id !== warehouseId) {
          throw new Error(`Material con ID ${materialId} no encontrada en la bodega asignada al colaborador`);
        }
  
        // Verificar si la cantidad asignada es mayor que la cantidad disponible
        if (assignedQuantity > material.quantity) {
          throw new Error(`La cantidad asignada del material con ID ${materialId} es mayor que la cantidad disponible`);
        }
  
        // Actualizar la cantidad de la herramienta en el inventario
        await this.materialRepository.decrement(
          { id: materialId },
          'quantity',
          assignedQuantity
        );
        
       
      }
    } catch (error) {
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);
    }
  }
  

  private handleDBExceptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('La entrada ya existe.');
    }

    if (error instanceof Error) {
      // Capturar y manejar errores específicos lanzados con el mensaje deseado
     //console.error('error-message',error.message);
      throw new BadRequestException(error.message);
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
