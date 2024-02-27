import * as moment from 'moment-timezone';
import { EntriesTool } from "./entries-tool.entity";
import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";


@Entity()
export class DetailsEntriesTools {
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

    @Column('int',{ default:0, nullable: false })
    quantity: number;

    @Column('float',{default:0, nullable: false })
    price: number;
  
    @Column({default:false, nullable: false })
    available: boolean;
  
    @Column('float',{default:0,nullable: false })
    total: number;

    @Column('text',{ nullable: true })
    observation: string;
          
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @ManyToOne(
        () => EntriesTool,
        entry => entry.details,
        )
    entryTool: EntriesTool;

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
