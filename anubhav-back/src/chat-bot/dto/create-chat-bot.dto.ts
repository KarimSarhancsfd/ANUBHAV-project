import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Book } from "src/books/entities/book.entity";

export class CreateChatBotDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'name', description: "name" })
    name: string

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 1, description: "chat_bot_id" })
    book_id: Book
}
