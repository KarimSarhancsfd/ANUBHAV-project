import { Group } from "../entity/GroupEntity";
import { Request, Response } from "express";
import { AppDataSource } from "../Config/dbConfig";

export default class GroupController {
    // Create
    public static addGroup = async (req: Request, res: Response): Promise<void> => {
        try {
            const groupRepo = AppDataSource.getRepository(Group);
            const newGroup = groupRepo.create(req.body);
            await groupRepo.save(newGroup);
            res.status(201).json(newGroup);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
    // Read (all)
    public static getGroup = async (req: Request, res: Response): Promise<void> => {
        try {
            const groupRepo = AppDataSource.getRepository(Group);
            const groups = await groupRepo.find();
            res.status(200).json(groups);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };

    // Read (single)
    public static getGroupById = async (req: Request, res: Response): Promise<void> => {
        try {
            const groupRepo = AppDataSource.getRepository(Group);
            const group = await groupRepo.findOneBy({ id: parseInt(req.params.id) });
            if (group) {
                res.status(200).json(group);
            } else {
                res.status(404).json({ message: "Group not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };

    // Update
    public static updateGroup = async (req: Request, res: Response): Promise<void> => {
        try {
            const groupRepo = AppDataSource.getRepository(Group);
            const group = await groupRepo.findOneBy({ id: parseInt(req.params.id) });
            if (group) {
                groupRepo.merge(group, req.body);
                const result = await groupRepo.save(group);
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: "Group not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };

    // Delete
    public static deleteGroup = async (req: Request, res: Response): Promise<void> => {
        try {
            const groupRepo = AppDataSource.getRepository(Group);
            const group = await groupRepo.findOneBy({ id: parseInt(req.params.id) });
            if (group) {
                await groupRepo.remove(group);
                res.status(204).send();
            } else {
                res.status(404).json({ message: "Group not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
}



// object copy it in body for test 
// {
//     "number_of_student": 26,
//     "startDate": 1698796800,
//     "endDate": 1701388800,
//     "courses": "Math, Science",
//     "review": "Excellent group"
// }