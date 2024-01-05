import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { CreateExitMaterialDto } from './dto/create-exit-material.dto';
import { UpdateExitMaterialDto } from './dto/update-exit-material.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { Repository } from 'typeorm';
import { Material } from 'src/materials/entities/material.entity';
import { Meter } from 'src/meters/entities/meter.entity';
import { DetailsExitMaterials, ExitMaterial } from './entities';
import { Contract } from 'src/contract/entities/contract.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDetailExitMaterialsDto } from './dto/create-details-exit-materials.dto';

@Injectable()
export class ExitMaterialsService {

  private readonly logger = new Logger('ExitMaterialsService')


  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Meter)
    private readonly meterRepository: Repository<Meter>,
    @InjectRepository(Contract)
    private readonly contarctRepository: Repository<Contract>,
    @InjectRepository(ExitMaterial)
    private readonly exitMaterialsRepository: Repository<ExitMaterial>,
    @InjectRepository(DetailsExitMaterials)
    private readonly detailsExitRepository: Repository<DetailsExitMaterials>,
  ) {}

  

  async create(createexitMaterialsDto: CreateExitMaterialDto, details: CreateDetailExitMaterialsDto[], user: User) {
  
    
    const { collaboratorId, contractId,...rest } = createexitMaterialsDto; 
    
    // Verificar si ya se hizo una salida al contrato de tipo instalación
    // Servicio común
async function validateNoPreviousExit(
  contractId: string,
  exitType: string, 
  exitMaterialsRepository: Repository<ExitMaterial>
) {

  const previousExit = await exitMaterialsRepository.findOne({
    where: {
     contract: { id: contractId },
     type: exitType
    },
    relations: ['contract']  
  });

  if (previousExit) {
    throw new BadRequestException(`Ya existe una salida previa de tipo ${exitType} para este contrato`);
  }
}

// Reuso para instalación
await validateNoPreviousExit(contractId, 'instalación', this.exitMaterialsRepository);

// Reuso para puesta en servicio
await validateNoPreviousExit(contractId, 'puesta en servicio', this.exitMaterialsRepository);
    
    // Continuar con la creación de la salida
    
    
    // Buscar el colaborador en la base de datos
    const collaborator = await this.collaboratorRepository.findOne({
      where:{id:collaboratorId},
      relations:['warehouse']
    });

    if (!collaborator) {
      throw new NotFoundException('Colaborador no encontrado');
    }
// Buscar el contrato en la base de datos
    const contract = await this.contarctRepository.findOne({
      where:{id:contractId},
      relations:['warehouse']
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }   
    
    const ware= collaborator.warehouse.id              
   
   try {   
     // Creamos la instancia de ToolAssignment sin los detalles
 const newMaterialAssignment = await this.exitMaterialsRepository.create({
  ...rest,
  user,
  collaborator,
  contract,
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

const savedMaterialAssignment = await this.exitMaterialsRepository.save(newMaterialAssignment);

const detailAssignments = [];

for (const detail of detailsWithMaterials) {
detailAssignments.push(
  this.detailsExitRepository.create({
    ...detail,
    detailsExitMaterialsId: savedMaterialAssignment
  })
);
}
//console.log('data save',detailAssignments);

await this.detailsExitRepository.save(detailAssignments);
  
  
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

  let exitMaterialQuery = this.exitMaterialsRepository.createQueryBuilder('exitMaterial')
    .leftJoinAndSelect('exitMaterial.collaborator', 'collaborator')
    .leftJoinAndSelect('exitMaterial.contract', 'contract')
    .leftJoinAndSelect('exitMaterial.details', 'details')
    .leftJoinAndSelect('details.material', 'material')
    .leftJoinAndSelect('details.meter', 'meter')
    .leftJoinAndSelect('exitMaterial.user', 'user')
    .leftJoinAndSelect('exitMaterial.warehouse', 'warehouse');

  if (!user.rol.includes('admin')) {
    // Si no es administrador, aplicar restricciones por bodega
    exitMaterialQuery = exitMaterialQuery
      .where('user.id = :userId', { userId: user.id })
      .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
  }
  // Agrega la condición para excluir las erramientas eliminados
    exitMaterialQuery = exitMaterialQuery.andWhere('exitMaterial.deletedAt IS NULL');

  const exitMaterial = await exitMaterialQuery
    .skip(offset)
    .take(limit)
    .getMany();

  return  exitMaterial
}

async findOne(id: string,user: User) {
  const exitMaterialsAndMeter = await this.exitMaterialsRepository.findOne({
    where: {id: id},     
      relations: ['collaborator','contract','user', 'details.material', 'details.meter']      
  });

  if (!exitMaterialsAndMeter) {
    throw new NotFoundException(`Asignación de material con ID ${id} no encontrada.`);
  }  
  return exitMaterialsAndMeter;
}

// update(id: number, updateAssignmentMaterialsVehicleDto: UpdateAssignmentMaterialsVehicleDto) {
//   return `This action updates a #${id} assignmentMaterialsVehicle`;
// }



async remove(id: string, user: User) {
  const exitMaterialsAndMeter = await this.exitMaterialsRepository.findOneBy({id: id});

  if (!exitMaterialsAndMeter) {
    throw new NotFoundException(`Salida de materiales con ID ${id} no encontrada.`);
  }


  await this.exitMaterialsRepository.delete(id);

  return { message: 'Salida de materiales eliminada con éxito.' };
} 



private async verifyMaterialsExistence(details: CreateDetailExitMaterialsDto[], warehouseId: string): Promise<void> {
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
        throw new Error(`Material con ID ${materialId} no encontrada en la bodega asignada`);
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


      // Buscar la herramienta en la base de datos
      const meter = await this.meterRepository.findOne({
        where: { id: materialId },
        relations: ['warehouse']
      });

      if (!meter) {
        throw new Error(`Medidor con ID ${materialId} no encontrado`);
      }

      // Verificar si la herramienta pertenece a la bodega del colaborador
      if (meter.warehouse.id !== warehouseId) {
        throw new Error(`Medidor con ID ${materialId} no encontrado en la bodega asignada `);
      }

      // Verificar si la cantidad asignada es mayor que la cantidad disponible
      if (assignedQuantity > meter.quantity) {
        throw new Error(`La cantidad asignada del meter con ID ${materialId} es mayor que la cantidad disponible`);
      }

      // Actualizar la cantidad de la herramienta en el inventario
      await this.meterRepository.decrement(
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





