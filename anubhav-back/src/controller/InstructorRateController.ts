import { Request, Response } from "express";
import { AppDataSource } from "../Config/dbConfig";
import { InstructorRate } from "../entity/InstructorRateEntitiy";


export default class Instructor {
    public static addInstructor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId, instructorId } = req.body
            const instructorRateRepo = AppDataSource.getRepository(InstructorRate)
            const createInstructorRate = instructorRateRepo.create({ course_id: courseId, instructor_id: instructorId })
            if (!createInstructorRate) {
                res.status(404).json({ message: 'Instructor not found' })
                return
            }
            await instructorRateRepo.save(createInstructorRate)
            res.status(200).json({ createInstructorRate, message: 'created successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error })
        }
    }

    public static getAllInstructors = async (req: Request, res: Response): Promise<void> => {
        try {
            const instructorRateRepo = AppDataSource.getRepository(InstructorRate)
            const allInstructorRate = await instructorRateRepo.find()
            if (!allInstructorRate) {
                res.status(404).json({ message: 'Instructor Rate Not Found' })
                return
            }
            res.status(200).json({ allInstructorRate, message: 'data fetched successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error })
        }
    }

    public static getOneInstructor = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id)
            const instructorRateRepo = AppDataSource.getRepository(InstructorRate)
            const getInstructor = await instructorRateRepo.findOne({ where: { id } })
            if (!getInstructor) {
                res.status(404).json({ message: 'Instructor Rate Not Found' })
                return
            }
            res.status(200).json({ message: 'data fetched successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error })
        }
    }

    public static deleteInstructorRate = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id)
            const instructorRateRepo = AppDataSource.getRepository(InstructorRate)
            const getInstructor = await instructorRateRepo.findOne({ where: { id } })
            if (!getInstructor) {
                res.status(404).json({ message: 'Instructor Rate Not Found' })
                return
            }
            await instructorRateRepo.delete(id)
            res.status(200).json({ message: 'Instructor Rate Deleted Successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error })
        }
    }

    public static updatedInstructorRate = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id)
            const { courseId, instructorId } = req.body
            const instructorRateRepo = AppDataSource.getRepository(InstructorRate)
            const getInstructor = await instructorRateRepo.findOne({ where: { id } })
            if (!getInstructor) {
                res.status(404).json({ message: 'Instructor Rate Not Found' })
                return
            }
            const updatedInstructorRate = instructorRateRepo.merge(getInstructor, { course_id: courseId, instructor_id: instructorId })
            await instructorRateRepo.save(updatedInstructorRate)
            res.status(200).json({ message: 'Instructor Rate Deleted Successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error })
        }
    }
}