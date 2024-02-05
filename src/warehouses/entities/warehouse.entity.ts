import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "../../auth/entities/user.entity";
import { Material } from "../../materials/entities/material.entity";
import { Tool } from "../../tools/entities/tool.entity";
import { Meter } from "../../meters/entities/meter.entity";
import { Provider } from "../../providers/entities/provider.entity";
import { Collaborator } from "../../collaborators/entities/collaborator.entity";
import { Vehicle } from "../../vehicles/entities/vehicle.entity";
import { Contract } from "../../contract/entities/contract.entity";
import { Entry } from "../../entries/entities";
import { Transfer } from "../../transfers/entities";
import { ToolAssignment } from "../../tool-assignment/entities/tool-assignment.entity";
import { AssignmentMaterialsVehicle } from "../../assignment-materials-vehicle/entities";
import { ExitMaterial } from "../../exit-materials/entities/exit-material.entity";
import { EntriesTool } from "../../entries-tools/entities/entries-tool.entity";

@Entity()
export class Warehouse {
    
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('varchar',{unique: true, nullable: true})
  name: string;
    
  @Column( 'datetime')
  date: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
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

  @OneToMany(() => EntriesTool, entry => entry.warehouse )
   entriesTool: EntriesTool[];

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

