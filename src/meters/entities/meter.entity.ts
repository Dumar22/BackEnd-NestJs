import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { DetailsExitMaterials } from "src/exit-materials/entities";

@Entity()
export class Meter {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    name: string;
  
    @Column({nullable: false })
    code: string;
  
    @Column({nullable: false })
    unity: string;

    @Column('int',{ default:0, nullable: false })
    quantity: number;

    @Column('float',{default:0, nullable: false })
    price: number;

    @Column({nullable: false })
    serial: string;

    @Column({nullable: false })
    brand: string;
  
    @Column({default:false, nullable: true })
    available: boolean;
  
    @Column('float',{default:0,nullable: false })
    total: number;

    @Column('float',{default:0, nullable: false })
    iva: number;

    @Column('float',{default:0, nullable: false })
    total_iva: number;

    @Column('text',{ nullable: true })
    observation: string;
          
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
     () => User,
     (user) => user.meter,
     {eager: true})
    user: User

    @ManyToOne(() => Warehouse, warehouse => warehouse.meters)
    warehouse: Warehouse;
    
   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   
    @BeforeInsert()
    insertTotal(){
        this.name = this.name.toUpperCase()
        this.total = this.price* this.quantity;
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();
        this.available = this.quantity > 0 ? true : false;
    }
    @BeforeUpdate()
    updateTotal(){
        this.name = this.name.toUpperCase()
        this.total = this.price* this.quantity;
        this.updatedAt =  new Date();
        this.available = this.quantity > 0 ? true : false;
    }

}
