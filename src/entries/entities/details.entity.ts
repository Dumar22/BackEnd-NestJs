import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { Entry } from "./entry.entity";

@Entity()
export class DetailsEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    name: string;
  
    @Column({nullable: false })
    code: string;
  
    @Column({nullable: false })
    unity: string;

    @Column({nullable: true })
    serial: string;

    @Column({nullable: true })
    brand: string;

    @Column('float',{ default:0, nullable: false })
    quantity: number;

    @Column('float',{default:0, nullable: false })
    price: number;
  
    @Column({default:false, nullable: true })
    available: boolean;
  
    @Column('float',{default:0,nullable: true })
    total: number;

    @Column('text',{ nullable: true })
    observation: string;
          
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @ManyToOne(
        () => Entry,
        entry => entry.details,
        )
    entry: Entry;

   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   
    @BeforeInsert()
    insertTotal(){
        this.name = this.name.toUpperCase()
        this.total = this.price * this.quantity;
        this.available = this.quantity > 0 ? true : false;
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();
    }
    @BeforeUpdate()
    updateTotal(){
        this.name = this.name.toUpperCase()
        this.total = this.price * this.quantity;
        this.available = this.quantity > 0 ? true : false;
        this.updatedAt =  new Date();
    }
}
