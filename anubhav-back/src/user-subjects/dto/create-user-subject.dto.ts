import { IsNumber, IsString } from "class-validator";
import { SchoolSubject } from "src/school-subject/entities/school-subject.entity";
import { User } from "src/user/entities/user.entity";

export class CreateUserSubjectDto {
    @IsNumber()
    user_id: User

    @IsNumber()
    subject_id: SchoolSubject

    @IsString()
    row_3: string
}
