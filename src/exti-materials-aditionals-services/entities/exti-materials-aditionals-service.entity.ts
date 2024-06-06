
import * as moment from 'moment-timezone';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import { Contract } from 'src/contract/entities/contract.entity';
import { ExtiMaterialsAditionalsDetailsService } from './index';
import { ContractPostService } from 'src/contract/entities/contract-post-service.entity';


@Entity()
export class ExtiMaterialsAditionalsService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0, nullable: false })
  ExitNumber: number;

  @Column({ nullable: false })
  date: Date;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  state: string;

  @Column('text', { nullable: true })
  observation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.exitMaterial, {
    eager: true,
  })
  collaborator: Collaborator;

  @ManyToOne(() => ContractPostService, (contract) => contract.exitMaterial, {
    eager: true,
  })
  contract: ContractPostService;

  @ManyToOne(() => User, (user) => user.exitMaterial, { eager: true })
  user: User;

  @Column({ nullable: true })
  deletedBy: string;

  @Column({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.exitMaterial, {
    eager: true,
  })
  warehouse: Warehouse;

  @OneToMany(
    () => ExtiMaterialsAditionalsDetailsService,
    (details) => details.exitMaterial,{
      eager: true,
    } )
  details: ExtiMaterialsAditionalsDetailsService[];

  @BeforeInsert()
  insertTotal() {
    this.createdAt = moment().tz('America/Bogota').toDate();
    this.updatedAt = new Date();    
  }
  
  @BeforeUpdate()
  updateTotal() {
    this.updatedAt = new Date();
  }
}

