import { IsNumber, IsString } from "class-validator"

export class CreateSchoolSubjectDto {

    // @IsNumber()
    // country_id: Country
    
    @IsString()
    grade: string

    @IsString()
    semester: string

    @IsString()
    book_url: string

    @IsString()
    video_url: string

    @IsString()
    file_url: string
}
