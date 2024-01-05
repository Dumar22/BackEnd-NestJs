import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";

@Entity()
export class Provider {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    name: string;
  
    @Column({nullable: false })
    nit: string;
                
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
     () => User,
     (user) => user.provider,
     {eager: true})
    user: User

    @ManyToOne(() => Warehouse, warehouse => warehouse.providers)
    warehouse: Warehouse;


   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   
    @BeforeInsert()
    insertTotal(){
        this.name = this.name.toUpperCase()       
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();
       
    }
    @BeforeUpdate()
    updateTotal(){
        this.name = this.name.toUpperCase()        
        this.updatedAt =  new Date();       
    }
}