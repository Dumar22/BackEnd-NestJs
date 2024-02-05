import { Type } from "class-transformer";
import { IsDate, IsString, MinLength } from "class-validator";

export class CreateWarehouseDto {


    @IsString()
    @MinLength(5)
    name: string;
    @IsDate()
    @Type(() => Date)
    date: Date;
}
