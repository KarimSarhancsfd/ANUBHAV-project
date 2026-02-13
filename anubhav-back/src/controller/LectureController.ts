import { Lecture } from "../entity/LectureEntity";
import { Request, Response } from "express";
import { AppDataSource } from "../Config/dbConfig";

export default class LectureController{
    // Create
    public static createLecture = async (req: Request, res: Response): Promise<void> => {
        try {
            const LectureRepo = AppDataSource.getRepository(Lecture);
            const newLecture = LectureRepo.create(req.body);
            await LectureRepo.save(newLecture);
            res.status(201).json(newLecture);
        } catch (error){
            console.error(error); // Add this line to log the actual error
            res.status(500).json({message: "Internal Server Error", error: error instanceof Error ? error.message : 'Unknown error occurred'})
        }

    }
    // Read (all)
    public static getAllLecture = async (req: Request, res: Response): Promise<void> => {
        try {
            const LectureRepo = AppDataSource.getRepository(Lecture);
            const newLecture = await LectureRepo.find();
            res.status(200).json(newLecture)
        } catch (error){
            console.error(error); // Add this line to log the actual error
            res.status(500).json({message: "Internal Server Error", error: error instanceof Error ? error.message : 'Unknown error occurred'})
        }

    };

    // Read (single)
    public static getLectureById = async (req: Request, res: Response): Promise<void> => {
        try {
            const LectureRepo = AppDataSource.getRepository(Lecture);
            const newLecture = await LectureRepo.findOneBy({ id: parseInt(req.params.id) });
            if (newLecture) {
                res.status(200).json(Lecture);
            } else {
                res.status(404).json({ message: "Lecture not found" });
            }
        }catch (error){
            console.error(error); // Add this line to log the actual error
            res.status(500).json({message: "Internal Server Error", error: error instanceof Error ? error.message : 'Unknown error occurred'})
        }
    };

    // Update
    public static updateLecture = async (req: Request, res: Response): Promise<void> => {
        try {
            const LectureRepo = AppDataSource.getRepository(Lecture);
            const newLecture = await LectureRepo.findOneBy({ id: parseInt(req.params.id) });
            if (newLecture) {
                LectureRepo.merge(newLecture, req.body);
                const result = await LectureRepo.save(newLecture);
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: "Lecture not found" });
            }
        } catch (error){
            console.error(error); // Add this line to log the actual error
            res.status(500).json({message: "Internal Server Error", error: error instanceof Error ? error.message : 'Unknown error occurred'})
        }

    };

    // Delete (soft delete)
    public static deleteLecture = async (req: Request, res: Response): Promise<void> => {
        try {
            const LectureRepo = AppDataSource.getRepository(Lecture);
            const newLecture = await LectureRepo.findOneBy({ id: parseInt(req.params.id) });
            if (newLecture) {
                await LectureRepo.softRemove(newLecture);
                res.status(204).send();
            } else {
                res.status(404).json({ message: "Lecture not found" });
            }
        } catch (error){
            console.error(error); // Add this line to log the actual error
            res.status(500).json({message: "Internal Server Error", error: error instanceof Error ? error.message : 'Unknown error occurred'})
        }

    };
}