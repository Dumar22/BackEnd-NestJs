import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Entity, OneToMany } from "typeorm";
import { DetailsListMaterials } from "./details-list-material.entity";
@Entity()
export class ListExitMaterial {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    nameList: string;

@CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;   

    @OneToMany(
        () => DetailsListMaterials, detalle => detalle.list)
    details: DetailsListMaterials[];
   
    @ManyToOne(
        () => User,
        (user) => user.materialList,
        {eager: true})
       user: User 
      

    @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   @ManyToOne(() => Warehouse, 
   warehouse => warehouse.materialsList,
   {eager:true})
   warehouse: Warehouse;  
}
