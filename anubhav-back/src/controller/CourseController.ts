import { AppDataSource } from './../Config/dbConfig';
import { Course } from './../entity/CourseEntity';
import { Request, Response } from "express";

export default class CourseController {
    public static addCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const { imageUrl, duration, rate, details, videoUrl, category_id } = req.body
            const courseRepo = AppDataSource.getRepository(Course);
            const newCourse = courseRepo.create({ imageUrl, duration, rate, details, videoUrl, category_id });
            await courseRepo.save(newCourse);
            res.status(201).json({ newCourse, message: 'Course Added Successfly' });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Errors", error });
        }
    };

    public static getCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const courseRepo = AppDataSource.getRepository(Course);
            const course = await courseRepo.find({
                relations: {
                    category_id: true,
                },
            });
            res.status(200).json(course);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };


    public static getOneCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id)
            const courseRepo = AppDataSource.getRepository(Course)
            const course = await courseRepo.findOneBy({ id: id })

            if (course) res.status(200).json({ course, message: 'success fetch' })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };

    public static deleteCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id
            console.log(id);
            const courseRepo = AppDataSource.getRepository(Course);
            const course = await courseRepo.delete(id)
            res.status(200).json({ course, message: 'Course Deleted Successfly' });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };

    public static updateCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = Number(req.params.id)
            const { imageUrl, duration, rate, details, videoUrl } = req.body
            const courseRepo = AppDataSource.getRepository(Course);
            const course = await courseRepo.findOne({ where: { id } })

            if (!course) {
                res.status(404).json({ message: 'course not found' })
                return
            }
            if (imageUrl) course.imageUrl = imageUrl;
            if (duration) course.duration = duration;
            if (rate) course.rate = rate;
            if (details) course.details = details;
            if (videoUrl) course.videoUrl = videoUrl;

            await courseRepo.save(course)
            res.status(200).json({ course, message: 'Course Updated Successfly' });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
}