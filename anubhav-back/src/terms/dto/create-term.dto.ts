import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateTermDto {

     @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "test policy", description: "Policy of the terms" })
    policy: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "test terms", description: "Terms of the policy" })
    term: string;
}
