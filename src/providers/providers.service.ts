import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';

@Injectable()
export class ProvidersService {
  
  private readonly logger = new Logger('ProvidersService')

  constructor(   
    @InjectRepository( Provider)
    private readonly providersRepository: Repository<Provider>,
    private readonly fileUploadService: FileUploadService

  ){}

  async create(createProviderDto: CreateProviderDto, user: User) {

    const existingProvider = await this.providersRepository.createQueryBuilder()
    .where('(provider.name = :name OR provider.nit = :nit) AND warehouseId = :warehouseId', { 
      name: createProviderDto.name, 
      nit: createProviderDto.nit,
      warehouseId: user.warehouses[0].id  
    })
    .getOne();
  
      if (existingProvider) {
        throw new BadRequestException(`El Proveedor ${createProviderDto.name} ó el nit ${createProviderDto.nit}ya existe en la bodega ${user.warehouses[0].name}.`);
      }

    try {   

       const provider = this.providersRepository.create({
       ...createProviderDto,
       user, 
       warehouse: user.warehouses[0]
        
      });

     await this.providersRepository.save(provider);

      return {provider: provider, message:'Proveedor creado'}
      
    } catch (error) {          
      //console.log(error); 
      this.handleDBExeptions(error)
    }
   

  }

  async createxls(createProviderDto: CreateProviderDto, user: User, fileBuffer: Buffer) {
    try {
      // Lógica para procesar el archivo Excel y obtener la lista de proveedores
      const providers = await this.fileUploadService.processExcel(fileBuffer, this.providersRepository, (entry: CreateProviderDto) => {
        return this.providerDataFormat(entry, user);
      });   
        
      // Lista de proveedores que no fueron cargados
      const failedProviders: { provider: CreateProviderDto; reason: string }[] = [];
  
      for (const provider of providers) {
        const ExistingProvider = await this.providersRepository.createQueryBuilder()
        .where('(provider.name = :name OR provider.nit = :nit) AND warehouseId = :warehouseId', {
          name: provider.name,  
          nit: provider.nit,
          warehouseId: user.warehouses[0].id  
        })
    .getOne();
          
    if (ExistingProvider) {
      failedProviders.push({ 
        provider: provider, 
        reason: `El proveedor ${provider.name} ya existe en la bodega ${user.warehouses[0].name}.` 
      });    
    } else {    
      // Guardar el proveedor solo si no existe
      await this.providersRepository.save(provider);     
    }
      }
  
      return { providers: providers, failedProviders: failedProviders, message: 'Proveedores creados' };
    } catch (error) {
      //console.log(error);
      this.handleDBExeptions(error);
    }
  }
  
  
  private providerDataFormat(entry: CreateProviderDto, user: User): Provider {
    return this.providersRepository.create({
      ...entry,
      user,
      warehouse: user.warehouses[0],
    });
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let providersQuery = this.providersRepository.createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('provider.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      providersQuery = providersQuery
        .where('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir los proveedores eliminados
      providersQuery = providersQuery.andWhere('provider.deletedAt IS NULL');
  
    const providers = await providersQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return providers
  }

 async findOne(term: string, user: User) {
   
   let provider: Provider;
     if (isUUID(term)) {
      provider = await this.providersRepository.findOneBy({id: term});
     }else{
      //material = await this.materialsRepository.findOneBy({name: term});
      const queryBuilder = this.providersRepository.createQueryBuilder();
      provider = await queryBuilder
       .where('UPPER(name) =:name or nit =:nit',{
        name: term.toUpperCase(),
        code: term,
       }).getOne();
    }    
    if (!provider)
      throw new NotFoundException(`El material no fue encontrado.`);

      return provider;
  }  
  
 async update(id: string, updateProviderDto: UpdateProviderDto, user: User) {
    
    const provider = await this.providersRepository.preload({
      id: id,
      ...updateProviderDto
    });
      
    const existingProvider = await this.providersRepository.createQueryBuilder()
    .where('(LOWER(provider.name) = LOWER(:name) OR provider.nit = :nit) AND provider.warehouseId = :warehouseId', {
      name: updateProviderDto.name,
      nit: updateProviderDto.nit,
      warehouseId: user.warehouses[0].id
    })
    .andWhere('provider.id != :providerId', { providerId: id })
    .getOne();

  if (existingProvider && (existingProvider.name !== provider.name || existingProvider.nit !== provider.nit)) {
    throw new BadRequestException(`El Proveedor ${updateProviderDto.name} ó en nit ${updateProviderDto.nit} ya existe en la bodega ${user.warehouses[0].name}.`);
  }

      
        try {
          await this.providersRepository.save(provider);
          return provider;
   
        } catch (error) {
          this.handleDBExeptions(error)
        }
  }

  async remove(id: string, user: User) {

    const provider = await this.providersRepository.findOneBy({id: id});

  if (provider) {
    provider.deletedBy = user.id;
    provider.deletedAt = new Date();

    await this.providersRepository.save(provider);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Proveedor eliminado.'}
  }else{
    throw new NotFoundException(`El proveedor no fue encontrado.`);
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
