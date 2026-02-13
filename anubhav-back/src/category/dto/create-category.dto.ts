import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "test category", description: "Name of the category" })
    name: string

    @IsString()
    @IsOptional()
    @ApiProperty({ example: "image", description: "image of the category" })
    image: string
}
