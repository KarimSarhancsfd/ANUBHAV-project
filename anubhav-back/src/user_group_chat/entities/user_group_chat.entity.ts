
import { Group } from "src/groups/entities/group.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserGroupChat {


    @PrimaryGeneratedColumn()
    id!: number ; 

    // @ManyToOne(()=> User , (user)=> user.id )
    // @JoinColumn({name:"user_id"})
    @Column()
    user_id!: number ; 
    // User
    // @ManyToOne(()=> Group , (group)=> group.id )
    // @JoinColumn({name:"group_id"})
    @Column()
    group_id!: number ; 
    // Group

    // @ManyToOne(()=> User , (user)=> user.id )
    // @JoinColumn({name:"sender_id"})
    @Column()
    sender_id!: number ; 
    // User
    // @ManyToOne(()=> UserGroups , (userGroup)=> userGroup.id )
    // @JoinColumn({name:"users_group_id"})
    @Column()
    users_group_id!: number ; 
    // UserGroups

    @Column()
    message!:string ; 

    @Column()
    image_url!: string ; 

    @Column()
    record_url !: string ; 

    
    @Column()
    file_url !: string ; 

    @Column()
    seen !: boolean ; 

    

}
