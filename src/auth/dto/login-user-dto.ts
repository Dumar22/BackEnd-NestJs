import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
export class LoginUserDto {



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


}