import { UserAttach } from '../entity/UserAttachEntity';
import { Request,Response } from 'express';
import { AppDataSource } from '../Config/dbConfig';


export default class UserAttachController{

    public static addUser = async (req: Request, res: Response): Promise<void> =>{
        try{
            const UserAttachRepo =AppDataSource.getRepository(UserAttach);
            const newUserAttach =UserAttachRepo.create(req.body);
            await UserAttachRepo.save(newUserAttach);
            res.status(201).json(newUserAttach);
        }catch (error){
            console.error(error); // Add this line to log the actual error
            res.status(500).json({message: "Internal Server Error", error: error instanceof Error ? error.message : 'Unknown error occurred'})
        }
    };

    public static getUserAttach = async (req: Request, res: Response): Promise<void> => {
        try{
            const UserAttachRepo = AppDataSource.getRepository(UserAttach);
            const UserAttach_ = await UserAttachRepo.find();
            res.status(200).json(UserAttach_)
        }catch (error){
            console.error(error); // Add this line to log the actual error
            res.status(500).json({message: "Internal Server Error", error: error instanceof Error ? error.message : 'Unknown error occurred'})
        }
    };

    public static getUserAttachById = async (req: Request, res: Response): Promise<void> => {
        try{
            const UserAttachRepo = AppDataSource.getRepository(UserAttach);
            const UserAttach_ = await UserAttachRepo.findOneBy({ id: parseInt(req.params.id) });
            if(UserAttach_){
                res.status(200).json(UserAttach_)
            }else{
                res.status(404).json({message: "User not found"})
            }
    
        }catch (error){
            console.error(error); // Add this line to log the actual error
            res.status(500).json({message: "Internal Server Error", error: error instanceof Error? error.message : 'Unknown error occurred'})
        }
    }

    public static updateUserAttach = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ 
                    success: false,
                    message: "User attachment ID is required"
                });
                return;
            }

            const userAttachRepo = AppDataSource.getRepository(UserAttach);
            
            // Find the specific user attachment by ID
            const existingUserAttach = await userAttachRepo.findOne({ 
                where: { id: parseInt(id) }
            });

            if (!existingUserAttach) {
                res.status(404).json({
                    success: false,
                    message: "User attachment not found"
                });
                return;
            }

            // Merge the existing record with update data
            userAttachRepo.merge(existingUserAttach, req.body);

            // Validate and save the updated record
            const updatedUserAttach = await userAttachRepo.save(existingUserAttach);

            res.status(200).json({
                success: true,
                message: "User attachment updated successfully",
                data: updatedUserAttach
            });

        } catch (error) {
            console.error('Error updating user attachment:', error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    };


    public static deleteUserAttach = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }

            const userAttachRepo = AppDataSource.getRepository(UserAttach);
            
            // Check if user attachment exists
            const userAttach = await userAttachRepo.findOne({ where: { id: parseInt(id) } });
            
            if (!userAttach) {
                res.status(404).json({ message: "User attachment not found" });
                return;
            }

            // Perform the deletion
            await userAttachRepo.remove(userAttach);
            
            res.status(200).json({ 
                success: true,
                message: "User attachment deleted successfully" 
            });

        } catch (error) {
            console.error('Error deleting user attachment:', error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    };
}