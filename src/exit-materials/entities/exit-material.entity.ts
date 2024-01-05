import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Contract } from 'src/contract/entities/contract.entity';
import { DetailsExitMaterials } from './details-exit-materials';

@Entity()
export class ExitMaterial {

@PrimaryGeneratedColumn('uuid')
id: string;

@Column({nullable: false })
date: Date;

@Column({nullable: false })
type: string;

@Column('text',{nullable: true })
observation: string;
    
@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;   
    
@ManyToOne(() => Collaborator, 
collaborator => collaborator.exitMaterial, 
{eager:true})
 collaborator: Collaborator;

@ManyToOne(() => Contract, 
contract => contract.exitMaterial, 
{eager:true})
contract: Contract;

@ManyToOne(
 () => User,
 (user) => user.exitMaterial,
 {eager: true})
  user: User 
   
@Column({ nullable: true })
 deletedBy: string;

@Column({ nullable: true })
deletedAt: Date;

@ManyToOne(() => Warehouse, 
warehouse => warehouse.exitMaterial,
{eager:true})
warehouse: Warehouse;   
   
@OneToMany(
() => DetailsExitMaterials,
details => details.detailsExitMaterials,
{eager: true})
details: DetailsExitMaterials[];

   
    @BeforeInsert()
    insertTotal(){
              
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();        
    }
    @BeforeUpdate()
    updateTotal(){              
        this.updatedAt =  new Date();
       
    }


}
