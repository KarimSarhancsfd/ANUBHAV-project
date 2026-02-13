import { Request, Response } from "express";
import { AppDataSource } from "../Config/dbConfig";
import { GroupRate } from "../entity/GroupRateEntity";

export default class GroupRateController {
  public static getOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const groupRateRepo = AppDataSource.getRepository(GroupRate);
      const rate = await groupRateRepo.findOneBy({ id: +req.params.id });
      if (!rate) res.status(404).json({ message: "Not found" });
      res.status(200).json(rate);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public static add = async (req: Request, res: Response): Promise<void> => {
    try {
      const groupRateRepo = AppDataSource.getRepository(GroupRate);
      const data = groupRateRepo.create(req.body);
      const result = await groupRateRepo.save(data);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  };

  public static update = async (req: Request, res: Response): Promise<void> => {
    try {
      const groupRateRepo = AppDataSource.getRepository(GroupRate);
      const rate = await groupRateRepo.findOneBy({ id: +req.params.id });
      if (!rate) res.status(404).json({ message: "Not found" });

      else {
        groupRateRepo.merge(rate, req.body);
        const result = await groupRateRepo.save(rate);
        res.json(result);
      }


    } catch (err) {
      res.status(500).json({ error: err });
    }
  };

  public static remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const groupRateRepo = AppDataSource.getRepository(GroupRate);
      const result = await groupRateRepo.softDelete(+req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  };

  public static getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const groupRateRepo = AppDataSource.getRepository(GroupRate);
      const all = await groupRateRepo.find();
      res.json(all);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  };
}
