import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";

export class CreateUserGroupChatDto {


    @IsNotEmpty()
    @IsNumber()
    user_id!: number ; 
    // User
    @IsNotEmpty()
    @IsNumber()
    group_id!: number ; 
    // Group

    @IsNotEmpty()
    @IsNumber()
    sender_id!: number ; 
    // User
    // @ManyToOne(()=> UserGroups , (userGroup)=> userGroup.id )
    // @JoinColumn({name:"users_group_id"})
    @IsNumber()
    @IsNotEmpty()
    users_group_id!: number ; 
    // UserGroups

    @IsString()
    @IsNotEmpty()
    message!:string ; 

    @IsString()
    @IsNotEmpty()
    image_url!: string ; 

    @IsString()
    @IsNotEmpty()
    record_url !: string ; 

    
    @IsString()
    @IsNotEmpty()
    file_url !: string ; 

    @IsBoolean()
    @IsNotEmpty()
    seen !: boolean ; 
    
        
    
}
