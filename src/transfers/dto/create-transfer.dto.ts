import { Type } from "class-transformer"
import { IsArray, IsDate, IsOptional,  IsString,  MinLength } from "class-validator"
import { DetailsTransfer } from "../entities"

export class CreateTransferDto {

    @IsDate()
    @Type(() => Date)
    date: Date

    @IsString()
    @MinLength(2)
    transferNumber : string
     
    @IsString()
    @MinLength(2)
    origin: string

    @IsString()
    @MinLength(2)
    destination: string

    @IsString()
    @MinLength(2)
    autorization: string

    @IsString()
    @MinLength(2)
    receive: string

    @IsString()
    @MinLength(2)
    documentreceive: string

    @IsString()
    @MinLength(2)
    delivery: string

    @IsString()
    @MinLength(2)
    documentdelivery: string

    @IsString()
    @IsOptional()
    observation?:string

    @IsArray()
    createDetailTransferDto?: DetailsTransfer[];

}
