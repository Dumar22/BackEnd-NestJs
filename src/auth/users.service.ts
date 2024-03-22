import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateUserDto,UpdateUserDto,LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload-interface';
import { isUUID } from 'class-validator';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';



@Injectable()
export class UsersService {
  private readonly logger = new Logger('MaterialsService')
constructor(
@InjectRepository(User)
private readonly userRepository: Repository<User>,
private readonly jwtService: JwtService,
@InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
){}
  async create(createUserDto: CreateUserDto) {   
    const warehouseIds = createUserDto.warehouseIds
    const warehouses = await this.warehouseRepository.find({
      where: {
        id: In(warehouseIds)
      }
    });
    if (warehouses.length !== warehouseIds.length) {
      throw new NotFoundException('Una o más bodegas proporcionadas no existen');
    }    
    try {         
      const {password, ...userData} = createUserDto;       
        //console.log(userData);
          
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 11),
        warehouses: warehouses
      })
      //console.log(user);      
      await this.userRepository.save(user)
      delete user.password

      return { user: user,
        token: this.getJwtToken({ id: user.id }), Message:'Usuario creado con exito'}
    } catch (error) {      
      this.handleDBExeptions(error)
    }
  }

  async login(loginUserDto: LoginUserDto){

    const {password, user} = loginUserDto;
    const userLogin = await this.userRepository.findOne({
      where: {user},
      select: { user: true, password: true, id: true}
    })

    if(!userLogin)
      throw new UnauthorizedException('Credenciales no válidas (user)')

      if( !bcrypt.compareSync(password, userLogin.password))
         throw new UnauthorizedException('Credenciales no válidas (password)')

         const { password:_, ...rest  } = userLogin

    return {
      user: rest,
     token: this.getJwtToken({id: userLogin.id})};    
  } 

  async findAll() {
    const users =await this.userRepository.find()
    return users
  }

 async findOne(id: string) {
    let user: User;
    if (isUUID(id)) {
      user = await this.userRepository.findOneBy({id: id});
      //console.log(user);
      
    } else{
      throw new NotFoundException(`El usuario ${id} no fue encontrado.`);
    } 
     
     return  user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: User) {
    const warehouseIds = updateUserDto.warehouseIds;
    const warehouses = await this.warehouseRepository.find({
        where: {
            id: In(warehouseIds)
        }
    });

    if (warehouses.length !== warehouseIds.length) {
        throw new NotFoundException('Una o más bodegas proporcionadas no existen');
    }   

    const userData = await this.userRepository.findOneBy({ id: id });

    if (!userData) {
        throw new NotFoundException(`Usuario con el id ${id} no encontrado`);
    }

    try {
      let { password, warehouseIds: dtoWarehouseIds, ...userDataWithoutPassword } = updateUserDto;
      //console.log(updateUserDto);
      
      const userUpdate = await this.userRepository.preload({
          id: id, // Asegúrate de incluir el campo id
          ...userDataWithoutPassword,
          password: bcrypt.hashSync(password, 11),
          warehouses: warehouses
      });
  
      if (!userUpdate) {
          throw new NotFoundException(`No se pudo actualizar el usuario con ID: ${id}`);
      }
  
      const updatedUser = await this.userRepository.save(userUpdate);
  
      return { message: 'Usuario actualizado con éxito' };
  } catch (error) {
      this.handleDBExeptions(error);
  }
}

 async remove(id: string) {
    await this.userRepository.delete({ id });
    return {message:'Usuario eliminado.'}
  }
   
   getJwtToken(payload: JwtPayload){
  const token = this.jwtService.sign(payload);
  return token;
  }

  
  private handleDBExeptions(error: any): never{    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('El usuario ya existe, intente con uno diferente');
    }
       this.logger.error(error);
       // console.log(error);            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
