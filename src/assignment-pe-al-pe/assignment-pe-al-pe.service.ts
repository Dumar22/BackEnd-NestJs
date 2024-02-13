import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { AssignmentPealPeDetailsDto, CreateAssignmentPeAlPeDto } from './dto/create-assignment-pe-al-pe.dto';
import { UpdateAssignmentPeAlPeDto } from './dto/update-assignment-pe-al-pe.dto';
import * as moment from 'moment-timezone';


import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as currencyFormatter from 'currency-formatter';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { logoBase64 } from 'src/common/helpers/logo-base64';


moment.tz.setDefault("America/Bogota");
import { Material } from 'src/materials/entities/material.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { AssignmentPeAlPe } from './entities/assignment-pe-al-pe.entity';
import { AssignmentDetails } from './entities/details-assignment-pe-al-pe.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class AssignmentPeAlPeService {

  private readonly logger = new Logger('AssignmentPeAlPeService')

  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    
    @InjectRepository(AssignmentPeAlPe)
    private readonly materialAssignmentRepository: Repository<AssignmentPeAlPe>,
    @InjectRepository(AssignmentDetails)
    private readonly materialAssignmentDetailRepository: Repository<AssignmentDetails>,
  ) {pdfMake.vfs = pdfFonts.pdfMake.vfs;}

  async create(createAssignmentPeAlPeDto: CreateAssignmentPeAlPeDto, details: AssignmentPealPeDetailsDto[], user: User) {
  
    
    const { collaboratorId,...rest } = createAssignmentPeAlPeDto;   
    
    //console.log(createToolAssignmentDTO);
    
    // Buscar el colaborador en la base de datos
    const collaborator = await this.collaboratorRepository.findOne({
      where:{id:collaboratorId},
      relations:['warehouse']
    });

    if (!collaborator) {
      throw new NotFoundException('Colaborador no encontrado');
    }
//
    const ware= collaborator.warehouse.id              
   
   try {   
     // Creamos la instancia de ToolAssignment sin los detalles
 const newMaterialAssignment = await this.materialAssignmentRepository.create({
  ...rest,
  user,
  collaborator,
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
    assignmentDetails: savedMaterialAssignment
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
  // const { limit = 10, offset = 0 } = paginationDto;

  let materialAssignmentQuery = this.materialAssignmentRepository.createQueryBuilder('materialAssignment')
    .leftJoinAndSelect('materialAssignment.collaborator', 'collaborator')    
    .leftJoinAndSelect('materialAssignment.details', 'details')
    .leftJoinAndSelect('details.material', 'material')
    .leftJoinAndSelect('materialAssignment.user', 'user')
    .leftJoinAndSelect('materialAssignment.warehouse', 'warehouse');

  if (!user.rol.includes('admin')) {
    // Si no es administrador, aplicar restricciones por bodega
    materialAssignmentQuery = materialAssignmentQuery
      .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
  }
  // Agrega la condición para excluir las erramientas eliminados
    materialAssignmentQuery = materialAssignmentQuery.andWhere('materialAssignment.deletedAt IS NULL');

  const materialassignment = await materialAssignmentQuery
    // .skip(offset)
    // .take(limit)
    .getMany();

  return  materialassignment
}

async findOne(id: string,user: User) {
  const materialAssignment = await this.materialAssignmentRepository.findOne({
    where: {id: id},     
      relations: ['collaborator','details', 'details.material']      
  });

  if (!materialAssignment) {
    throw new NotFoundException(`Asignación de material Pe al Pe con ID ${id} no encontrada.`);
  }  
  return materialAssignment;
}

async generarPDF(id: string, user: User): Promise<Buffer> {
  const exitData = await this. materialAssignmentRepository.findOneBy({id: id}); 
  
  if (!exitData) {
    throw new NotFoundException('Asignación de materiales no encontrada');
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
      { text: 'ASIGNACION MATERIALES A VEHICULOS', fontSize: 14, alignment: 'center', margin: [0, 15, 0, 35] },
      {
        columns: [
          // Datos a la izquierda
          [
            { text: 'Fecha de salida: ' + formattedDate, fontSize: 10 },
            { text: 'Responsable: ' + exitData.collaborator.name, fontSize: 10 },
            { text: 'cargo: ' + exitData.collaborator.operation, fontSize: 10, },
            { text: 'Documento: ' + exitData.collaborator.document, fontSize: 10, margin: [0, 0, 0, 20] },
          ],
         
        ],
      },
      // ... Otros detalles según sea necesario
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Código', style: 'tableHeader' },
              { text: 'Material', style: 'tableHeader' },
              { text: 'Unidad', style: 'tableHeader' },
              { text: 'Cantidad Asignada', style: 'tableHeader' },
              { text: 'Precio', style: 'tableHeader' },
              { text: 'Total', style: 'tableHeader' },
            ],
            // Agrega filas con los detalles del traslado
            ...exitData.details.map((detail) => [
              {text: detail.material.code, alignment: 'center', fontSize: 8},
               {text: detail.material.name, alignment: 'center', fontSize: 8}, 
              {text: detail.material.unity, alignment: 'center', fontSize: 8},
              { text: detail.assignedQuantity, alignment: 'center',fontSize: 9 }, // Centrar la cantidad
              {text: detail.material.price, alignment: 'center', fontSize: 9},
              {text: detail.total, alignment: 'center', fontSize: 9}
            ]),
            ['', '','', '', { text: 'Total', style: 'tableHeader' }, {text: totalFormatted, style: 'tableHeader'}],
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

// update(id: string, updateAssignmentMaterialsVehicleDto: UpdateAssignmentMaterialsVehicleDto,details: CreateAssignmentDetailsMaterialsVehicleDto[], user: User) {
//   return `This action updates a #${id} assignmentMaterialsVehicle`;
// }

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


private async verifyMaterialsExistence(details:AssignmentPealPeDetailsDto [], warehouseId: string): Promise<void> {
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
