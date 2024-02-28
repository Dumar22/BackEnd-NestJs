import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,  ParseUUIDPipe, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto,  UpdateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RoleProtected, RowHeaders } from './decorators';
import { User } from './entities/user.entity';
import { ValidRols } from './interfaces/valid-rols';
import { UseRoleGuard } from './guards/use-role/use-role.guard';
import { LoginResponse } from './interfaces/jwt-payload-interface';




@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @Auth(ValidRols.admin, ValidRols.superUser)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }


  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute( 
    //@Req() request: Express.Request
    @GetUser() user: User,
    @GetUser('fullName') userFullName: User,
    @RowHeaders() rawHeaders: string[],
    //@Headers() headers: IncomingHttpHeaders,
    
  ) {
   
    //console.log({ user: request.user});
    return{
      ok: true,
      message: 'Private ',
      user,
      rawHeaders,
      //headers
    }
  }

//  @SetMetadata('roles',['admin', 'user'])

  @Get('private2') 
  @RoleProtected( ValidRols.admin)
  @UseGuards( AuthGuard(), UseRoleGuard )
  privateRoute2( 
    //@Req() request: Express.Request
    @GetUser() user: User,
       
  ) {   
      return{
      ok: true,     
      user
    }
  }
  @Get('private3') 
  @Auth()
  privateRoute3( 
    //@Req() request: Express.Request
    @GetUser() user: User,
       
  ) {   
      return{
      ok: true,     
      user
    }
  }

  @Get('check-token')
  @Auth()
  checkToken( @Request() req: Request ): LoginResponse {
      
    const user = req['user'] as User;

    return {
      user,
      token: this.usersService.getJwtToken({ id: user.id })
    }

  }

  @Get()
  @Auth(ValidRols.admin, ValidRols.superUser)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRols.admin, ValidRols.superUser)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}


