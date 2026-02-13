import { UserGroup } from './../entity/UserGroupEntity';

import { Request ,Response } from "express";

import { AppDataSource } from "../Config/dbConfig";

export default class UserGroupController{

    public static addUserGroup = async(req:Request, res:Response):Promise<void>=>{
        try{
            const userGroupRepo = AppDataSource.getRepository(UserGroup) ; 
            const newGroupUser = userGroupRepo.create(req.body) ; 
            await userGroupRepo.save(newGroupUser) ; 
            res.status(201).json(newGroupUser) ; 

        }catch(error){
            res.status(500).json({message: `${error}`})
        }
    } ; 


    public static getUserGroup = async (req:Request , res:Response):Promise<void>=> {
        try{
            const UserGroupRepo = AppDataSource.getRepository(UserGroup) ; 
            const groupUser = await UserGroupRepo.find() ; 
            res.status(200).json(groupUser) ; 
        } catch(error){
            res.status(500).json({message:"Internal server Error" } ) 
        }
    } ; 

    public static deleteUserGroup = async (req: Request , res: Response ): Promise<void>=>{
        try{
            const UserGroupRepo = AppDataSource.getRepository(UserGroup)
            const result = await UserGroupRepo.delete(req.params.id) ;
            if(result.affected=== 0 ){
                 res.status(404).json({message:"Product not fonud"} ) ; 
            } 
            res.status(204).json({message:`User with ${req.params.id} has been deleted...!`})
    }catch(error){
        res.status(500).json({message:`${error}`})
    }
    } ; 

    public static updateUserGroup = async (req: Request , res:Response): Promise<void>=>{
        try{
            
            const UserGroupRepo = AppDataSource.getRepository(UserGroup)
            const item = await UserGroupRepo.findOne({where:{id: +(req.params.id)}}) ; 
            if(!item){
                res.status(404).json({message:"product not found"}) 

            }else{
                UserGroupRepo.merge(item , req.body)  ; 
                const results = await UserGroupRepo.save(item) ;
                res.send(results) ;
            }


        }catch(error){
            res.status(500).json({message:`${error}`}) ; 
        }
    } ; 
}