import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateChatBotMessageDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, description: "user_id" })
    user_id: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, description: "chat_bot_id" })
    chat_bot_id: number

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'message', description: "message" })
    message: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'record_url', description: "record_url" })
    record_url: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'image_url', description: "image_url" })
    image_url: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'archive', description: "archive" })
    archive: string
}
