import { IsString, MinLength, MaxLength, Matches, IsArray } from 'class-validator';

export class CreateUserDto {  
 
      
@IsString()
fullName: string;

@IsString()
user:string

@IsString()
@MinLength(6)
@MaxLength(20)
@Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number'
})
password: string;

@IsArray()
warehouseIds: string[];



@IsArray()
rol:string[]

}
