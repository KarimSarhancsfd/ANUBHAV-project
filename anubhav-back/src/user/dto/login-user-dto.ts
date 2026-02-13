import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginUserDto {

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({ example: 'user@email.com', description: 'email' })
    email: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'password', description: 'password' })
    password: string
}