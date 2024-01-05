import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { AssignmentMaterialsVehicle } from "src/assignment-materials-vehicle/entities";

@Entity()
export class Vehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    make: string;
  
    @Column({nullable: false })
    plate: string;
  
    @Column({nullable: false })
    model: string;
    
    @Column({default:false, nullable: false })
    status: boolean;
      
    @Column('text',{ nullable: true })
    observation: string;
          
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
     () => User,
     (user) => user.vehicle,
     {eager: true})
    user: User

    @ManyToOne(() => Warehouse, warehouse => warehouse.vehicles)
    warehouse: Warehouse;

    @OneToMany(() => AssignmentMaterialsVehicle, 
    assignmentMaterialsVehicle => assignmentMaterialsVehicle.vehicle)
    assignmentMaterialsVehicle: AssignmentMaterialsVehicle[];


   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   
    @BeforeInsert()
    insertTotal(){
        this.make = this.make.toUpperCase()
        this.plate = this.plate.toUpperCase()       
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();
       
    }
    @BeforeUpdate()
    updateTotal(){
        this.make = this.make.toUpperCase()
        this.plate = this.plate.toUpperCase() 
        this.updatedAt =  new Date();
    
    }
}