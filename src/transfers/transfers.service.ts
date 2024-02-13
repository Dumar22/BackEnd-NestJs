import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { DetailsTransfer, Transfer } from './entities';
import { Material } from 'src/materials/entities/material.entity';
import { Meter } from 'src/meters/entities/meter.entity';
import { User } from 'src/auth/entities/user.entity';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDetailTransferDto, UpdateDetailTransferDto } from './dto';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as currencyFormatter from 'currency-formatter';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { logoBase64 } from 'src/common/helpers/logo-base64';

import *as moment from 'moment-timezone';

moment.tz.setDefault("America/Bogota");

@Injectable()
export class TransfersService {

  private readonly logger = new Logger('EntriesService')

  constructor(   
    @InjectRepository( Transfer)
    private readonly transfersRepository: Repository<Transfer>,
    @InjectRepository( DetailsTransfer)
    private readonly detailsTransferRepository: Repository<DetailsTransfer>,
    @InjectRepository( Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository( Meter)
    private readonly meterRepository: Repository<Meter>,
    
  ){  pdfMake.vfs = pdfFonts.pdfMake.vfs;}

  async create(createTransferDto: CreateTransferDto, createDetailTransferDto: CreateDetailTransferDto[], user: User) {
    // Verificar si ya existe un traslado con el mismo número en la misma bodega
    const existingTransfer = await this.transfersRepository.createQueryBuilder('transfer')
      .where('transfer.transferNumber = :transferNumber AND warehouseId = :warehouseId', {
        transferNumber: createTransferDto.transferNumber,
        warehouseId: user.warehouses[0].id,
      })
      .getOne();
  
    if (existingTransfer) 
      throw new BadRequestException(`El traslado ${createTransferDto.transferNumber} ya existe en la bodega ${user.warehouses[0].name}.`);
    
  
    try {
      // Crear el traslado
      const transfer = await this.transfersRepository.create({
        ...createTransferDto,
        user,
        warehouse: user.warehouses[0],
        details: createDetailTransferDto
      });    
        
      // Actualizar materiales y medidores antes de guardar el traslado
      await this.updateMaterialAndMeterDetails(transfer);
  
      // Guardar el traslado en la base de datos
      const savedTransfer = await this.transfersRepository.save(transfer);
  
      // Crear los detalles de materiales y asociarlos al traslado
      const materialDetailsTransfer = createDetailTransferDto.map((materialDetailTransfer) => {
        const materialTransfer = this.detailsTransferRepository.create({
          ...materialDetailTransfer,
          transfer: savedTransfer, // Asociar el detalle al traslado recién creado
        });
  
        return materialTransfer;
      });
  
      // Guardar los detalles de materiales en la base de datos
      await this.detailsTransferRepository.save(materialDetailsTransfer);
  
      return { transfer: savedTransfer, message: 'Traslado creado' };
    } catch (error) {
      //console.log(error);
  
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);
    }
  }

  
  async generarPDF(id: string, user: User): Promise<Buffer> {
    const transferData = await this.transfersRepository.findOneBy({id: id});
    
    if (!transferData) {
      throw new NotFoundException('Traslado no encontrado');
    }

    const formattedDate = moment(transferData.date).format('DD/MM/YYYY HH:mm');
  
    // Calcular el total de los detalles del traslado
    const totalMat = transferData.details.reduce((acc, detail) => acc + (detail.total), 0);
    const totalFormatted = currencyFormatter.format(totalMat, { code: 'COP' });

    transferData.details.forEach((detail) => {
      detail.price = currencyFormatter.format(detail.price, { code: 'USD' }); // Cambia 'USD' según tu moneda
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
        { text: 'TRASLADOS', fontSize: 14, alignment: 'center', margin: [0, 15, 0, 35] },
        {
          columns: [
            // Datos a la izquierda
            [
              { text: 'Fecha del traslado: ' + formattedDate, fontSize: 10 },
              { text: 'Origen: ' + transferData.origin, fontSize: 10 },
              { text: 'Envía: ' + transferData.delivery, fontSize: 10 },
              { text: 'Autoriza: ' + transferData.autorization, fontSize: 10, margin: [0, 0, 0, 20] },
            ],
            [
              { text: 'Número de traslado: ' + transferData.transferNumber, fontSize: 10 },
              { text: 'Destino: ' + transferData.destination, fontSize: 10 },
              { text: 'Recibe: ' + transferData.receive, fontSize: 10 },
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
                { text: 'Cantidad', style: 'tableHeader' },
                { text: 'Precio unidad', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' },
              ],
              // Agrega filas con los detalles del traslado
              ...transferData.details.map((detail) => [
                {text: detail.code, alignment: 'center', fontSize: 8},
                 {text: detail.name, alignment: 'center', fontSize: 8}, 
                {text: detail.unity, alignment: 'center', fontSize: 8},
                { text: detail.quantity, alignment: 'center', fontSize: 9}, // Centrar la cantidad
                {text: detail.price, alignment: 'center', fontSize: 9},
                {text: detail.total, alignment: 'center', fontSize: 9}
              ]),
              ['', '', '', '', { text: 'Total', style: 'tableHeader' }, {text: totalFormatted, style: 'tableHeader'}],
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
        { text: 'Observaciones: ' + transferData.observation, fontSize: 12, margin: [0, 20] },
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

  async findAll(paginationDto: PaginationDto, user: User) {
    // const { limit = 10, offset = 0 } = paginationDto;
  
    let transfersQuery = this.transfersRepository.createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.details', 'details')
      .leftJoinAndSelect('transfer.user', 'user')
      .leftJoinAndSelect('transfer.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      transfersQuery = transfersQuery
        // .andWhere('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las erramientas eliminados
      transfersQuery = transfersQuery.andWhere('transfer.deletedAt IS NULL');
  
    const transfers = await transfersQuery
      // .skip(offset)
      // .take(limit)
      .getMany();
  
    return transfers
  }

  async findOne(term: string, user: User) {
    let transfer: Transfer;
  
    if (isUUID(term)) {
      transfer = await this.transfersRepository.findOne({
        where: [{id: term}],
          relations: ['details'],
         });
    } else {
      transfer = await this.transfersRepository.findOne({
        where: [
          { destination: term },
          { transferNumber: term },
          // Añade otras propiedades según sea necesario para tu búsqueda
        ],
        relations: ['details'],
      });
    }
  
    if (!transfer) {
      throw new NotFoundException(`El traslado no fue encontrado.`);
    }
  
    return transfer;
  }

  async searchTransfer(term: string, user: User) {

    
    let data = await this.transfersRepository.find({
      where: [
        { transferNumber: Like(`%${term}%`) },
        { destination: Like(`%${term}%`) }
      ],
    });
    return data;
  }

  
  async update(id: string, updateTransferDto: UpdateTransferDto, updateDetailTransferDtos: UpdateDetailTransferDto[], user: User) {
    
    const existingTransfer = await this.transfersRepository.findOne({
      where: [{id: id}],
        relations: ['details'],
       });
  
    if (!existingTransfer)
      throw new NotFoundException(`Traslado con ID ${id} no encontrado.`);
     
   try {
     // Actualizar el traslado con los datos proporcionados en updateTransferDto
    this.transfersRepository.merge(existingTransfer, updateTransferDto);
  
    // Actualizar los detalles del traslado
    const updatedDetails = updateDetailTransferDtos.map(updateDetailTransferDto => {
      const existingDetail = existingTransfer.details.find(detail => detail.name === updateDetailTransferDto.name);
  
      if (!existingDetail) {
        throw new NotFoundException(`Detalle con ID ${updateDetailTransferDto.id} ya existe en el traslado.`);
      }
  
      // Actualizar el detalle con los datos proporcionados en updateDetailTransferDto
      this.detailsTransferRepository.merge(existingDetail, updateDetailTransferDto);
      return existingDetail; 
    });

    // Actualizar materiales y medidores
    await this.updateMaterialAndMeterDetails(existingTransfer);
  
    // Guardar los cambios en la base de datos
    await this.transfersRepository.save(existingTransfer);
    await this.detailsTransferRepository.save(updatedDetails);
    
    return { transfer: existingTransfer, message: 'Traslado actualizado con éxito.' };
   } catch (error) {
    this.handleDBExceptions(error);
    throw error; 
   }
  }

  async remove(id: string, user: User) {

    const transfer = await this.transfersRepository.findOneBy({id: id});

  if (transfer) {
    transfer.deletedBy = user.id;
    transfer.deletedAt = new Date();

    await this.transfersRepository.save(transfer);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Traslado eliminado.'}
  }else{
    throw new NotFoundException(`La entrada no fue encontrado.`);
  }
}

async updateMaterialAndMeterDetails(transfer: Transfer) {
  try {
   
    for (const detail of transfer.details) {
      // Obtener el material existente
      const existingMaterial = await this.materialRepository.findOneBy({ code: detail.code });

      if (existingMaterial) {
        // Verificar si la cantidad a transferir es mayor que la cantidad disponible
        if (detail.quantity > existingMaterial.quantity) {
          throw new Error(`La cantidad a transferir de ${existingMaterial.name} es mayor a la cantidad disponible.`);
        }

        // Actualizar la cantidad restando la cantidad transferida
        await this.materialRepository.decrement(
          { code: detail.code },
          'quantity',
          detail.quantity
        );
      }else {
        // Si no existe el medidor en la bodega de destino, lanzar una excepción
        throw new Error(`El material con codigo ${detail.code} no existe en la bodega de destino ${transfer.warehouse.name}.`);
      }

    
      // Si el material es un medidor
      if (detail.name.startsWith("MEDIDOR")) {
        // Buscar si ya existe el medidor por código y serial en la bodega de destino
        const existingMeter = await this.meterRepository.createQueryBuilder()
          .where('meter.code = :code AND meter.serial = :serial AND warehouseId = :warehouseId', {
            code: detail.code, // Código del medidor
            serial: detail.serial, // Serial del medidor
            warehouseId: transfer.warehouse.id, // Id de la bodega de destino
          })
          .getOne();

        if (existingMeter) {
          // Si el medidor ya existe en la bodega de destino, actualizar disponibilidad y cantidad
          if (detail.quantity !== 1) {
            throw new Error(`La cantidad del medidor debe ser 1 para el traslado.`);
          }

          // Actualizar la disponibilidad y cantidad del medidor
          await this.meterRepository.update(
            { id: existingMeter.id },
            {
              available: false, // Cambiar disponibilidad a false
              quantity: () => `quantity - ${detail.quantity}`, // Incrementar la cantidad
            },
          );
        } else {
          // Si no existe el medidor en la bodega de destino, lanzar una excepción
          throw new Error(`El medidor con serie ${detail.serial} no existe en la bodega de destino ${transfer.warehouse.name}.`);
        }
      }
    }
  } catch (error) {
    // Propagar la excepción
    throw new Error(error);
  }
}  
  
    private handleDBExceptions(error: any){    
  
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('La entrada ya existe.');
      }
  
      if (error instanceof Error) {
        // Capturar y manejar errores específicos lanzados con el mensaje deseado
        //console.error(error.message);
        throw new BadRequestException(error.message);
      }
  
         this.logger.error(error);
              
        throw new InternalServerErrorException('Unexpected error, check server logs');
    }
}
function getBase64ImageFromURL(url: any) {
  throw new Error('Function not implemented.');
}

