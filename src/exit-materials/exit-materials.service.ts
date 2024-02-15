import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateExitMaterialDto } from './dto/create-exit-material.dto';
import * as moment from 'moment-timezone';
import { UpdateExitMaterialDto } from './dto/update-exit-material.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { Contract } from 'src/contract/entities/contract.entity';
import { Repository } from 'typeorm';
import { Material } from 'src/materials/entities/material.entity';
import { Meter } from 'src/meters/entities/meter.entity';
import { DetailsExitMaterials, ExitMaterial } from './entities';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDetailExitMaterialsDto } from './dto/create-details-exit-materials.dto';
import { UpdateDetailExitMaterialsDto } from './dto/update-details-exit-materials.dto';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as currencyFormatter from 'currency-formatter';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { logoBase64 } from 'src/common/helpers/logo-base64';
import { AssignmentPeAlPe } from 'src/assignment-pe-al-pe/entities/assignment-pe-al-pe.entity';


moment.tz.setDefault("America/Bogota");
@Injectable()
export class ExitMaterialsService {
  private readonly logger = new Logger('ExitMaterialsService');

  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Meter)
    private readonly meterRepository: Repository<Meter>,
    @InjectRepository(AssignmentPeAlPe)
    private readonly assignmentPeAlPeRepository: Repository<AssignmentPeAlPe>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(ExitMaterial)
    private readonly exitMaterialsRepository: Repository<ExitMaterial>,
    @InjectRepository(DetailsExitMaterials)
    private readonly detailsExitRepository: Repository<DetailsExitMaterials>,
  ) {  pdfMake.vfs = pdfFonts.pdfMake.vfs;}

  async create(
    createexitMaterialsDto: CreateExitMaterialDto,
    details: CreateDetailExitMaterialsDto[],
    user: User,
  ) {
   
    const { collaboratorId, contractId, ...rest } = createexitMaterialsDto;

    // Obtener el número de salida para el usuario actual
  const lastExitNumber = await this.getLastExitNumberForUser(user.id);


    // Verificar si ya se hizo una salida al contrato de tipo instalación
    // Servicio común
    async function validateNoPreviousExit(
      contractId: string,
      exitType: string,
      exitMaterialsRepository: Repository<ExitMaterial>,
    ) {
      const previousExit = await exitMaterialsRepository.findOne({
        where: {
          contract: { id: contractId },
          type: exitType,
        },
        relations: ['contract'],
      });

      if (previousExit) {
        throw new BadRequestException(
          `Ya existe una salida previa de tipo ${exitType} para este contrato`,
        );
      }
    }

    // Reuso para instalación
    await validateNoPreviousExit(
      contractId,
      'instalación',
      this.exitMaterialsRepository,
    );

    // Reuso para puesta en servicio
    await validateNoPreviousExit(
      contractId,
      'puesta en servicio',
      this.exitMaterialsRepository,
    );

    // Continuar con la creación de la salida

    // Buscar el colaborador en la base de datos
    const collaborator = await this.collaboratorRepository.findOne({
      where: { id: collaboratorId },
      relations: ['warehouse'],
    });

    if (!collaborator) {
      throw new NotFoundException('Colaborador no encontrado');
    }
    // Buscar el contrato en la base de datos
    const exisContract = await this.contractRepository.findOne({
      where: {id: contractId},
      relations: ['warehouse'],
    });

    console.log(exisContract);
    

    if (!exisContract) {
      throw new NotFoundException('Contrato no encontrado');
    }


    const ware = collaborator.warehouse.id;



    try {

      
      // Creamos la instancia de ToolAssignment sin los detalles
      const newMaterialAssignment = await this.exitMaterialsRepository.create({
        ...rest,
        user,
        ExitNumber: lastExitNumber + 1,
        collaborator,
        contract: exisContract,
        details,
        warehouse: user.warehouses[0],
      });
    

      // Verificar si todas las herramientas existen y
      // Actualiza la cantidad de herramientas en el inventario
      await this.verifyMaterialsExistence(details, ware);

      // Guardar la asignación en la base de datos

      const detailsWithMaterials = [];
      for (const detail of details) {
        const material = await this.materialRepository.findOneBy({
          id: detail.materialId,
        });
        const meter = await this.meterRepository.findOneBy({
          id: detail.materialId,
        });

        detailsWithMaterials.push({
          ...detail,
          meter,
          material,
        });
      }
      //console.log(detailsWithMaterials);

      const savedMaterialAssignment = await this.exitMaterialsRepository.save(
        newMaterialAssignment,
      );

      const detailAssignments = [];

      for (const detail of detailsWithMaterials) {
        detailAssignments.push(
          this.detailsExitRepository.create({
            ...detail,
            exitMaterial: savedMaterialAssignment,
          }),
        );
      }
      //console.log('data save',detailAssignments);

      await this.detailsExitRepository.save(detailAssignments);

      // Devolver la asignación completa con los detalles asociados
      return {message:'Salida creada correctamente.'};
    } catch (error) {
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);
    }
  }


  // Método para obtener el último número de salida para el usuario
private async getLastExitNumberForUser(userId: string): Promise<number> {
  const lastExit = await this.exitMaterialsRepository.findOne({
    where: { user: { id: userId } },
    order: { ExitNumber: 'DESC' },
  });

  return lastExit ? lastExit.ExitNumber : 0;
}
 

  async findAll(paginationDto: PaginationDto, user: User) {
    // const { limit = 10, offset = 0 } = paginationDto;

    let exitMaterialQuery = this.exitMaterialsRepository
      .createQueryBuilder('exitMaterial')
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
        // .andWhere('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', {
          warehouseIds: user.warehouses.map(warehouse => warehouse.id),
        });
    }
    // Agrega la condición para excluir las erramientas eliminados
    exitMaterialQuery = exitMaterialQuery.andWhere(
      'exitMaterial.deletedAt IS NULL',
    );

    const exitMaterial = await exitMaterialQuery
      // .skip(offset)
      // .take(limit)
      .getMany();

    return exitMaterial;
  }

  async findOne(id: string, user: User) {
    const exitMaterialsAndMeter = await this.exitMaterialsRepository.findOne({
      where: { id: id },
      relations: [
        'collaborator',
        'contract',
        'user',
        
        'details.material',
        'details.meter',
      ],
    });

    if (!exitMaterialsAndMeter) {
      throw new NotFoundException(
        `Asignación de material con ID ${id} no encontrada.`,
      );
    }
    return exitMaterialsAndMeter;
  }

  
  async searchExitMaterial(term: string, user: User) {
    let data = await this.exitMaterialsRepository.createQueryBuilder('exitMaterials')
    .leftJoinAndSelect('exitMaterials.collaborator', 'collaborator')
    .leftJoinAndSelect('exitMaterials.collaborator', 'contract')
    .where('collaborator.name LIKE :term OR exitMaterials.type LIKE :term OR contract.ot OR exitMaterials.ExitNumber', { term: `%${term}%` })
    .getMany();
    return data;
  }

  async update(id: string , updateExitMaterialsDto: UpdateExitMaterialDto,
    details: UpdateDetailExitMaterialsDto[],
    user: User, ) {

      // console.log(updateExitMaterialsDto);
      
      

      const { collaboratorId, contractId, ...rest } =updateExitMaterialsDto

       // Obtener la salida existente por su ID
  const exitMaterialsAndMeter = await this.exitMaterialsRepository.findOne({
    where: { id: id },
    relations: [
      'collaborator',
      'contract',
      'user',
      'details',
      'details.material',
      'details.meter',
    ],
  });

  if (!exitMaterialsAndMeter) {
    throw new NotFoundException(
      `Asignación de material con ID ${id} no encontrada.`);
    }

    async function validateNoPreviousExit(
      contractId: string,
      exitType: string,
      exitMaterialsRepository: Repository<ExitMaterial>,
    ) {
      const previousExit = await exitMaterialsRepository.findOne({
        where: {
          contract: { id: contractId },
          type: exitType,
        },
        relations: ['contract'],
      });

      if (previousExit) {
        
      }
    }
    
    await validateNoPreviousExit(
      contractId,
      'instalación',
      this.exitMaterialsRepository,
    );

    
    await validateNoPreviousExit(
      contractId,
      'puesta en servicio',
      this.exitMaterialsRepository,
    );

    const collaborator = await this.collaboratorRepository.findOne({
      where: { id: collaboratorId },
      relations: ['warehouse'],
    });

    if (!collaborator) {
      throw new NotFoundException('Colaborador no encontrado');
    }
    // Buscar el contrato en la base de datos
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: ['warehouse'],
    });

    if (!contract) {
      throw new NotFoundException('Contrato no encontrado');
    }

    //console.log('ExitMaterialsAndMeter before merge:', exitMaterialsAndMeter);
    const ware = collaborator.warehouse.id;
    try {
// Usar merge para copiar los valores de updateExitMaterialsDto en la entidad principal
this.exitMaterialsRepository.merge(exitMaterialsAndMeter, updateExitMaterialsDto);

// Actualizar los detalles de la salida
updateExitMaterialsDto.details.forEach((detail, index) => {
  if (exitMaterialsAndMeter.details[index]) {
    // Actualizar los campos necesarios de cada detalle
    exitMaterialsAndMeter.details[index].restore = detail.restore;
    exitMaterialsAndMeter.details[index].observation = detail.observation;
  }
});
// Verificar si todas las herramientas existen y
      // Actualiza la cantidad de herramientas en el inventario
     await this.retunMaterialsAndMeters(details, ware);

     // Actualizar las asignaciones "PE al PE"
await this.updatePEtoPEAssignments(collaboratorId, ware, details)


// Guardar la salida actualizada
const updatedExitMaterial = await this.exitMaterialsRepository.save(exitMaterialsAndMeter);
const updatedDetailsExitMaterial = await this.detailsExitRepository.save(exitMaterialsAndMeter.details);

// Realizar cualquier lógica adicional necesaria después de la actualización

return { message: 'Salida actualizada correctamente.', updatedExitMaterial, updatedDetailsExitMaterial };

} catch (error) {
  console.log('created',error);

 // Manejar las excepciones de la base de datos
 this.handleDBExceptions(error);
}

  
}


async generarPDF(id: string, user: User): Promise<Buffer> {
  const exitData = await this.exitMaterialsRepository.findOneBy({id: id}); 
  
  if (!exitData) {
    throw new NotFoundException('Salida de materiales no encontrada');
  }

  const formattedDate = moment(exitData.date).format('DD/MM/YYYY HH:mm');

  // Calcular el total de los detalles
  const totalMat = exitData.details.reduce((acc, detail) => acc + (detail.total), 0);
  const totalFormatted = currencyFormatter.format(totalMat, { code: 'COP' });

  exitData.details.forEach((detail) => {
    detail.material.price = currencyFormatter.format(detail.material.price, { code: 'USD' }); // Cambia 'USD' según tu moneda
    detail.total = currencyFormatter.format(detail.total, { code: 'USD' }); // Cambia 'USD' según tu moneda
  });

  const pdfDefinition = {
    pageSize: 'letter', //legal
    pageMargins: [40, 40, 40, 40],
    header: {
      image: logoBase64,
      fit: [100, 100],
      alignment: 'left',
      margin: [40, 20],
    },
    content: [
      { text: 'SALIDAS DE ALMACEN', fontSize: 14, alignment: 'center', margin: [0, 15, 0, 35] },
      {
        columns: [
          // Datos a la izquierda
          [
            { text: 'Fecha de salida: ' + formattedDate, fontSize: 10 },
            { text: 'Responsable: ' + exitData.collaborator.name, fontSize: 10 },
            { text: 'cargo: ' + exitData.collaborator.operation, fontSize: 10, },
            { text: 'Documento: ' + exitData.collaborator.document, fontSize: 10, margin: [0, 0, 0, 20] },
          ],
          [
            { text: 'Contrato: ' + exitData.contract.contract, fontSize: 10 },
            { text: 'Solicitud: ' + exitData.contract.request, fontSize: 10 },
            { text: 'Dirección: ' + exitData.contract.addres, fontSize: 10 },
            { text: 'Subsicriptor: ' + exitData.contract.name, fontSize: 10 },
          ],
        ],
      },
      // ... Otros detalles según sea necesario
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Código', style: 'tableHeader' },
              { text: 'Material', style: 'tableHeader' },
              { text: 'Unidad', style: 'tableHeader' },
              { text: 'Serial', style: 'tableHeader' },
              { text: 'Cantidad Asignada', style: 'tableHeader' },
              { text: 'Devuelve', style: 'tableHeader' },
              { text: 'Usado', style: 'tableHeader' },
              { text: 'Total', style: 'tableHeader' },
            ],
            // Agrega filas con los detalles del traslado
            ...exitData.details.map((detail) => [
              {text: detail.material?.code ? detail.material.code : detail.meter.code, alignment: 'center', fontSize: 8},
               {text: detail.material?.name ? detail.material.name : detail.meter.name,  // Usar medidor.name si material.name es null
               alignment: 'center',
               fontSize: 8,}, 
               {text: detail.material?.unity ? detail.material.unity : detail.meter.unity,  // Usar medidor.name si material.name es null
               alignment: 'center',
               fontSize: 8,}, 
               { text: detail.meter?.serial ? detail.meter.serial : '', alignment: 'center', fontSize: 8},
              {text: detail.assignedQuantity, alignment: 'center', fontSize: 9},
              { text: ' ', alignment: 'center', fontSize: 9 }, // Centrar la cantidad
              {text: detail.used, alignment: 'center', fontSize: 9},
              {text: detail.total, alignment: 'center', fontSize: 9}
            ]),
            ['', '','', '', '', '', { text: 'Total', style: 'tableHeader' }, {text: totalFormatted, style: 'tableHeader'}],
          ],
          layout: {
            defaultBorder: false, // Deshabilita los bordes por defecto
            hLineWidth: function(i, node) { return (i === 0 || i === node.table.body.length) ? 1 : 0; }, // Establece el ancho de línea horizontal
            vLineWidth: function(i, node) { return 0; }, // Deshabilita las líneas verticales
            hLineColor: function(i, node) { return 'black'; }, // Establece el color de línea horizontal
            paddingTop: function(i, node) { return 5; }, // Añade relleno superior a todas las celdas
            paddingBottom: function(i, node) { return 5; }, // Añade relleno inferior a todas las celdas
          },
          margin: [0, 10], // Establece el margen de la tabla
        },
      },
      { text: 'Observaciones: ' + exitData.observation, fontSize: 10, margin: [0, 20] },
    ],
    styles :{
      tableHeader: {
        bold: true,
        fontSize: 10,
        fillColor: '#F5F5F5',
        alignment: 'center',
      },
    }
  };
  
  
   

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    const pdfDocGenerator = pdfMake.createPdf(pdfDefinition);
    pdfDocGenerator.getBuffer((buffer) => {
      resolve(buffer);
    });
  });

  return pdfBuffer;
}


  async remove(id: string, user: User) {

    const exitMaterials =  await this.exitMaterialsRepository.findOneBy({ id: id });

    
    if (exitMaterials) {
      
      exitMaterials.deletedBy = user.id;
      exitMaterials.deletedAt = new Date();  
      await this.exitMaterialsRepository.save(exitMaterials);
      
    }else{
      throw new NotFoundException(
        `Salida de materiales con ID ${id} no encontrada.`,
      );
    }
    return { message: 'Salida de materiales eliminada con éxito.' };
  }

  private async verifyMaterialsExistence(
    details: CreateDetailExitMaterialsDto[],
    warehouseId: string,
  ): Promise<void> {
    try {
      for (const detail of details) {
       // console.log(details);

        const materialId = detail.materialId;
        const assignedQuantity = detail.assignedQuantity;

        // Buscar la material en la base de datos
        const material = await this.materialRepository.findOne({
          where: { id: materialId },
          relations: ['warehouse'],
        });

        if (!material) {
          const meter = await this.meterRepository.findOne({
            where: { id: materialId },
            relations: ['warehouse'],
          });

          if (!meter) {
            throw new Error(`Medidor con ID ${materialId} no encontrado`);
          }

          // Verificar si la herramienta pertenece a la bodega del colaborador
          if (meter.warehouse.id !== warehouseId) {
            throw new Error(
              `Medidor con ID ${materialId} no encontrado en la bodega asignada `,
            );
          }

          // Verificar si la cantidad asignada es mayor que la cantidad disponible
          if (assignedQuantity > meter.quantity) {
            throw new Error(
              `La cantidad asignada del meter con ID ${materialId} es mayor que la cantidad disponible`,
            );
          }

          // Actualizar la cantidad de la herramienta en el inventario
          await this.meterRepository.decrement(
            { id: materialId },
            'quantity',
            assignedQuantity,
          );

          await this.meterRepository.update(
            { id: materialId },
            { available: false }
          );
          
        } else {
          // Verificar si la herramienta pertenece a la bodega del colaborador
          if (material.warehouse.id !== warehouseId) {
            throw new Error(
              `Material con ID ${materialId} no encontrada en la bodega asignada`,
            );
          }

          // Verificar si el material es el que se desea omitir
        if (material.code === '10006401') {
          // Si es el material a omitir, no hacer nada
          continue;
        }

          // Verificar si la cantidad asignada es mayor que la cantidad disponible
          if (assignedQuantity > material.quantity) {
            throw new Error(
              `La cantidad asignada del material con ID ${material.name} es mayor que la cantidad disponible`,
            );
          }

          // Actualizar la cantidad de la herramienta en el inventario
          await this.materialRepository.decrement(
            { id: materialId },
            'quantity',
            assignedQuantity,
          );
        }
      }
    } catch (error) {
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);
    }
  }

  private async retunMaterialsAndMeters(
    details: UpdateDetailExitMaterialsDto[],
    warehouseId: string,
  ): Promise<void> {
    try {
      for (const detail of details) {
       // console.log(details);

        const materialId = detail.materialId;
        const assignedQuantity = detail.assignedQuantity;

        // Buscar la material en la base de datos
        const material = await this.materialRepository.findOne({
          where: { id: materialId },
          relations: ['warehouse'],
        });

        if (!material) {
          const meter = await this.meterRepository.findOne({
            where: { id: materialId },
            relations: ['warehouse'],
          });

          if (!meter) {
            throw new Error(`Medidor con ID ${materialId} no encontrado`);
          }

          // Verificar si la herramienta pertenece a la bodega del colaborador
          if (meter.warehouse.id !== warehouseId) {
            throw new Error(
              `Medidor con ID ${materialId} no encontrado en la bodega asignada `,
            );
          }

          // Actualizar la cantidad de la herramienta en el inventario
          await this.meterRepository.increment(
            { id: materialId },
            'quantity',
            assignedQuantity,
          );

          await this.meterRepository.update(
            { id: materialId },
            { available: true }
          );
          
        } else {
          // Verificar si la herramienta pertenece a la bodega del colaborador
          if (material.warehouse.id !== warehouseId) {
            throw new Error(
              `Material con ID ${materialId} no encontrada en la bodega asignada`,
            );
            }

          // Actualizar la cantidad de la herramienta en el inventario
          await this.materialRepository.increment(
            { id: materialId },
            'quantity',
            assignedQuantity,
          );
        }
      }
    } catch (error) {
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);
    }
  }

  async updatePEtoPEAssignments(collaboratorId: string, warehouseId:string, details: UpdateDetailExitMaterialsDto[]): Promise<void> {
    try {
      for (const detail of details) {
        const materialId = detail.materialId;
        const assignedQuantity = detail.assignedQuantity;
  
        const assignment = await this.assignmentPeAlPeRepository.findOne({
          where: {
            collaborator: { id: collaboratorId },
            warehouse:{ id: warehouseId },
            details: { material: { id: materialId } }
          },
          relations: ['details']
        });
  
        if (assignment) {
          for (const assignmentDetail of assignment.details) {
            const updatedUsedQuantity = assignmentDetail.used - assignedQuantity;
  
            if (updatedUsedQuantity < 0) {
              throw new Error('La cantidad a restar es mayor que la cantidad utilizada en la asignación "PE al PE".');
            }
  
            assignmentDetail.used = updatedUsedQuantity;
            assignment.updatedAt = new Date();
          }
  
          await this.assignmentPeAlPeRepository.save(assignment);
        } else {
          throw new NotFoundException('Asignación de material "PE al PE" no encontrada para el colaborador y material especificados.');
        }
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  
 
  

  private handleDBExceptions(error: any) {

    console.log(error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('La entrada ya existe.');
    }

    if (error instanceof Error) {
      // Capturar y manejar errores específicos lanzados con el mensaje deseado
      //console.error('error-message',error.message);
      throw new BadRequestException(error.message);
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
