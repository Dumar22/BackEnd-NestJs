import { User } from "src/auth/entities/user.entity";
import { Proyect } from "src/proyects/entities/proyect.entity";
import { PrimaryGeneratedColumn, ManyToOne, Entity, OneToMany } from "typeorm";
import { DetailsProyection } from "./details-proyection.entity";

@Entity()
export class Proyection {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => Proyect,
        (proyect) => proyect.proyection,
        {eager: true})
       proyect: Proyect 

       @OneToMany(
        () => DetailsProyection,
        details => details.proyection,
        {eager: true})
       details: DetailsProyection[];

    @ManyToOne(
        () => User,
        (user) => user.proyection,
        {eager: true})
       user: User 
}
