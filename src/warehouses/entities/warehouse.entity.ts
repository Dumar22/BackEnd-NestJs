import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Material } from "src/materials/entities/material.entity";
import { Tool } from "src/tools/entities/tool.entity";
import { Meter } from "src/meters/entities/meter.entity";
import { Provider } from "src/providers/entities/provider.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Vehicle } from "src/vehicles/entities/vehicle.entity";
import { Contract } from "src/contract/entities/contract.entity";
import { Entry } from "src/entries/entities";
import { Transfer } from "src/transfers/entities";
import { ToolAssignment } from "src/tool-assignment/entities/tool-assignment.entity";
import { AssignmentMaterialsVehicle } from "src/assignment-materials-vehicle/entities";
import { ExitMaterial } from "src/exit-materials/entities/exit-material.entity";

@Entity()
export class Warehouse {
    
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('varchar',{unique: true, nullable: true})
  name: string;
    
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, user => user.warehouses)
  users: User[];

  @OneToMany(() => Material, material => material.warehouse )
  materials: Material[];

  @OneToMany(() => Tool, tool => tool.warehouse )
  tools: Tool[];

  @OneToMany(() => Meter, meter => meter.warehouse )
   meters: Meter[];

  @OneToMany(() => Provider, provider => provider.warehouse )
   providers: Provider[];

  @OneToMany(() => Collaborator, collaborator => collaborator.warehouse )
   collaborators: Collaborator[];

  @OneToMany(() => Vehicle, vehicle => vehicle.warehouse )
   vehicles: Vehicle[];

  @OneToMany(() => Contract, contract => contract.warehouse )
   contracts: Contract[];

  @OneToMany(() => Entry, entry => entry.warehouse )
   entries: Entry[];

  @OneToMany(() => Transfer, transfer => transfer.warehouse )
   transfers: Transfer[];

  @OneToMany(() => ExitMaterial, exitMaterial => exitMaterial.warehouse )
   exitMaterial: ExitMaterial[];
  
  @OneToMany(() => ToolAssignment, toolAssignment => toolAssignment.warehouse )
  toolAssignments: ToolAssignment[];

  @OneToMany(() => AssignmentMaterialsVehicle, assignmentMaterialsVehicle => assignmentMaterialsVehicle.warehouse )
  assignmentMaterialsVehicle: AssignmentMaterialsVehicle[];
  
    @BeforeInsert()
    insert(){    
       this.name = this.name.toUpperCase()
      
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();
    }
    @BeforeUpdate()
    update(){  
      this.name = this.name.toUpperCase()     
        this.updatedAt =  new Date();
    }
}

