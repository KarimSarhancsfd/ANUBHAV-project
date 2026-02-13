

import { updateCourseRequest } from './../request/CourseRequest';


import { AppDataSource } from "../Config/dbConfig";
import {Request, Response} from "express"
import { CourseRate } from "../entity/CourseRate";


export default class CourseRateController{
    public static addCourseRate = async (req:Request, res:Response): Promise<void> => {
        try{
            const userCourseRateRepo =AppDataSource.getRepository(CourseRate);
            const newCourseRate = userCourseRateRepo.create(req.body)
            await userCourseRateRepo.save(newCourseRate);
            res.status(201).json(newCourseRate);

        }catch(error){
            res.status(500).json({message:`${error}`})
        }
    };
    

    public static getCourseRate = async (req:Request , res:Response):Promise<void> =>{
        try{
            const userCourseRateRepo = AppDataSource.getRepository(CourseRate);
            const courseRate = await userCourseRateRepo.find();
            res.status(200).json(courseRate)
        }catch(error){
            res.status(500).json({message:"Internal server Error"})
        }
    };

    public static deleteCourseRate = async (req:Request , res:Response): Promise<void> => {
        try{
            const UserCourseRateRepo = AppDataSource.getRepository(CourseRate)
            const result = await UserCourseRateRepo.delete(req.params.id);
            if(result.affected=== 0){
                res.status(404).json({message:"Product not fonud"});
            }
            res.status(204).json({message:`User with ${req.params.id} has been deleted...!`})
        }catch(error){
            res.status(500).json({message:`${error}`})
        }
    };


    public static getCourseRateById =async(req: Request , res:Response):Promise<void> =>{
        try{
            const courseRateRepo =AppDataSource.getRepository(CourseRate);
            const courses =await courseRateRepo.find();
            res.status(200).json(courses);
        }catch(error){
            res.status(500).json({ message: "Internal Server Error"})
        }
    };



    public static updateCourseRate =async (req:Request, res:Response): Promise<void> =>{
        try{
            const UserCourseRate =AppDataSource.getRepository(CourseRate)
            const item = await UserCourseRate.findOne({where:{id: +(req.params.id)}}) ;
            if(!item){
                res.status(404).json({message:"product not found"})

            }else{
                UserCourseRate.merge(item , req.body) ;
                const results =await UserCourseRate.save(item);
                res.send(results);
            }
        }catch(error){
            res.status(500).json({message:`${error}`});
        }
    };

}