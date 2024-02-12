import { Material } from "src/materials/entities/material.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { ListExitMaterial } from "./list-exit-material.entity";

@Entity()
export class DetailsListMaterials {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @ManyToOne(() => Material,
   material => material.materialAssignments,
   {eager: true})
  material: Material;


  @ManyToOne(
    () => ListExitMaterial, list => list.details,
    {eager: true})
  list: ListExitMaterial;
}