import { IsString, MinLength } from 'class-validator';


export class NemwMessageDto {

    @IsString()
    @MinLength(1)
    message: string;
}