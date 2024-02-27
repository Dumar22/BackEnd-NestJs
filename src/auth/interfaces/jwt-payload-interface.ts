import { User } from "../entities/user.entity";



export interface JwtPayload {
//fullName: string,
//user: string;

id: string;

//TODO: add more values of user
}

export interface LoginResponse {
    user: User;
    token: string;
}