import { Request, Response } from "express";
import { AppDataSource } from "../Config/dbConfig";
import { Category } from "../entity/CategoryEntity";


export default class CategoryController {
    public static getAllCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const categoryRepo = AppDataSource.getRepository(Category)
            const allCategory = await categoryRepo.find({ relations: ["course","course.users"] })
            if (!allCategory) {
                res.status(404).json({ message: 'categories not found' })
                return
            }
            res.status(200).json({ allCategory, message: 'categories fetched successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Errors", error })
        }
    }

    public static createCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const { categoryName, categoryDescription, categoryImage } = req.body
            const categoryRepo = AppDataSource.getRepository(Category)
            const createCategory = categoryRepo.create({ categoryName, categoryDescription, categoryImage })
            if (!createCategory) {
                res.status(404).json({ message: 'category not created' })
                return
            }
            await categoryRepo.save(createCategory)
            res.status(200).json({ createCategory, message: 'category created successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Errors", error })
        }
    }

    public static getOneCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id)
            const categoryRepo = AppDataSource.getRepository(Category)
            const category = await categoryRepo.findOne({ where: { id } })
            if (!category) {
                res.status(404).json({ message: 'category not found' })
                return
            }
            res.status(200).json({ category, message: 'category fetched successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Errors", error })
        }
    }

    public static deleteCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id)
            const categoryRepo = AppDataSource.getRepository(Category)
            const category = await categoryRepo.findOneBy({ id })
            if (!category) {
                res.status(404).json({ message: 'category not found' })
                return
            }
            await categoryRepo.delete(id)
            res.status(200).json({ message: 'category deleted successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Errors", error })
        }
    }

    public static updatedCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id)
            const { categoryName, categoryDescription, categoryImage } = req.body
            const categoryRepo = AppDataSource.getRepository(Category)
            const category = await categoryRepo.findOneBy({ id })
            if (!category) {
                res.status(404).json({ message: 'category not found' })
                return
            }
            const updatedCategory = categoryRepo.merge(category, { categoryName, categoryDescription, categoryImage })
            await categoryRepo.save(updatedCategory)
            res.status(200).json({ updatedCategory, messgae: 'category updated successfully' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Errors", error })
        }
    }
}