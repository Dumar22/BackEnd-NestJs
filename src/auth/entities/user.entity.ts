import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { Material } from "src/materials/entities/material.entity";
import { Tool } from "src/tools/entities/tool.entity";
import { Meter } from "src/meters/entities/meter.entity";
import { Provider } from "src/providers/entities/provider.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Vehicle } from "src/vehicles/entities/vehicle.entity";
import { Contract } from "src/contract/entities/contract.entity";
import { Entry } from "src/entries/entities";
import { Notification } from "src/notifications/entities/notification.entity";
import { Transfer } from "src/transfers/entities";
import { ToolAssignment } from "src/tool-assignment/entities/tool-assignment.entity";
import { AssignmentMaterialsVehicle } from "src/assignment-materials-vehicle/entities";
import { ExitMaterial } from "src/exit-materials/entities/exit-material.entity";
import { EntriesTool } from "src/entries-tools/entities/entries-tool.entity";
import { ListExitMaterial } from "src/list-exit-materials/entities/list-exit-material.entity";

@Entity()
export class User {
    
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('varchar',{unique: true, nullable: true})
  user: string;
  
  @Column('text')
  fullName: string;

  @Column('varchar',{select:false})
  password: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-array', nullable: false, })
  rol: string[] = ['usuario'] ;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Warehouse,  {eager: true})
  @JoinTable({
    name: 'UserWarehouse',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'warehouseId', referencedColumnName: 'id' },
  })
  warehouses: Warehouse[];

  @OneToMany(
    ()=> Material,
    (material) => material.user
  )
  material: Material

  @OneToMany(
    ()=> ListExitMaterial,
    (material) => material.user
  )
  materialList: ListExitMaterial

  @OneToMany(
    ()=> Tool,
    (tool) => tool.user
  )
  tool: Tool

  @OneToMany(
    ()=> Meter,
    (meter) => meter.user
  )
  meter: Tool

  @OneToMany(
    ()=> Provider,
    (provider) => provider.user
  )
  provider: Provider

  @OneToMany(
    ()=> Collaborator,
    (collaborator) => collaborator.user
  )
  collaborator: Collaborator
  
  @OneToMany(
    ()=> Vehicle,
    (vehicle) => vehicle.user
  )
 vehicle: Vehicle

  @OneToMany(
    ()=> Contract,
    (contract) => contract.user
  )
 contract: Contract

  @OneToMany(
    ()=> Entry,
    (entry) => entry.user
  )
 entry: Entry

  @OneToMany(
    ()=> EntriesTool,
    (entry) => entry.user
  )
 entryTool: EntriesTool

  @OneToMany(
    ()=> Transfer,
    (transfer) => transfer.user
  )
 transfer: Transfer

  @OneToMany(
    ()=> ExitMaterial,
    (exitMaterial) => exitMaterial.user
  )
 exitMaterial: ExitMaterial

  @OneToMany(
    ()=> ToolAssignment,
    (toolAssignment) => toolAssignment.user
  )
  toolAssignment: ToolAssignment

  @OneToMany(
    ()=> AssignmentMaterialsVehicle,
    (assignmentMaterialsVehicle) => assignmentMaterialsVehicle.user
  )
  assignmentMaterialsVehicle: AssignmentMaterialsVehicle


 @OneToMany(() => Notification, (notification) => notification.sender)
  sentNotifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  receivedNotifications: Notification[];

    @BeforeInsert()
    insert(){    
       this.fullName = this.fullName.toUpperCase()
      
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();
    }
    @BeforeUpdate()
    update(){  
      this.fullName = this.fullName.toUpperCase()     
        this.updatedAt =  new Date();
    }
}
