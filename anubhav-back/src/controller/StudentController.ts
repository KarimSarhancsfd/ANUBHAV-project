import { StudentRate } from "../entity/StudentRateEntity";
import { AppDataSource } from "./../Config/dbConfig";
import { Request, Response } from "express";

export default class StudentController {
  public static addStudent = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { group_id, instructor_id, rate, comment } =
        req.body;
      const studentRepo = AppDataSource.getRepository(StudentRate);
      const newStudent = studentRepo.create({
        group_id,
        instructor_id,
        rate,
        comment,
      });
      await studentRepo.save(newStudent);
      res.status(201).json({ newStudent, message: "StudentRate Added Successfly" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Errors", error });
    }
  };

  public static getStudent = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const studentRepo = AppDataSource.getRepository(StudentRate);
      const student_ = await studentRepo.find();
      res.status(200).json(student_);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  public static getOneStudent = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const studentRepo = AppDataSource.getRepository(StudentRate);
      const student_ = await studentRepo.findOneBy({ id: id });

      if (student_) res.status(200).json({ student_, message: "success fetch" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  public static deleteStudent = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id;
      console.log(id);
      const studentRepo = AppDataSource.getRepository(StudentRate);
      const student_ = await studentRepo.delete(id);
      res.status(200).json({ message: "StudentRate Deleted Successfly" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  public static updateCourse = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { group_id, instructor_id, rate, comment } =
        req.body;
      const StudentRepo = AppDataSource.getRepository(StudentRate);
      const student_ = await StudentRepo.findOne({ where: { id } });

      if (!student_) {
        res.status(404).json({ message: "StudentRate not found" });
        return;
      }
      StudentRepo.merge(student_, {
        group_id,
        instructor_id,
        rate,
        comment
      });
      await StudentRepo.save(student_);
      res.status(200).json({ student_, message: "StudentRate Updated Successfly" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
