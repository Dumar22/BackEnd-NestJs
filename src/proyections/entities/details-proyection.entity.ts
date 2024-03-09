import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { Proyection } from "./proyection.entity";


@Entity()
export class DetailsProyection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    name: string;
  
    @Column({nullable: false })
    code: string;
  
    @Column({nullable: false })
    unity: string;

    @Column('float',{ default:0, nullable: false })
    quantity: number;

    @Column('float',{ default:0, nullable: false })
    quantity_variable: number;
    
    @Column('float',{ default:0, nullable: false })
    used: number;  

    @Column('float',{default:0,nullable: false })
    total: number;
          
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @ManyToOne(
        () => Proyection,
        proyection => proyection.details,
        )
    proyection: Proyection;

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
