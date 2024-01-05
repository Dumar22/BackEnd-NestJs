import { IsString, MinLength } from "class-validator";

export class CreateWarehouseDto {


    @IsString()
    @MinLength(5)
    name: string;
}
