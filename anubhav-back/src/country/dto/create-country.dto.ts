import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCountryDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "country name", description: "country name" })
    name!: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "image Url", description: "image Url" })
    imageUrl!: string;
}
