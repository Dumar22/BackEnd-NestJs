import { IsBoolean, IsString } from "class-validator";
import { User } from "src/auth/entities/user.entity";

export class CreateNotificationDto {

    @IsString()
    message: string;

    @IsBoolean()
    isRead: boolean;

    sender: User;

    receiver: User;
}
