import { User } from "../entity/UserEntity";
import { Request, Response } from "express";
import { AppDataSource } from "../Config/dbConfig";
import bcrypt from "bcrypt";
const jwt = require("jsonwebtoken");

export default class UserController {
  // Add a new user
  public static addUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = userRepo.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
        // imgUrl: req.body.imgUrl,
      });
      const user = await userRepo.save(newUser);
      const token = jwt.sign({userId:user.id}, process.env.JWT_SECRET, {expiresIn: '1h'})
      newUser.token = token
      await userRepo.save(newUser);
      res.status(200).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Errors", error });
    }
  };

  // Login user
  public static loginUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ email: req.body.email })
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return
      }
      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid password" });
        return
      }
      res.status(200).json({ user, message: 'login successfully' })
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  // Generate a token here if needed
  // Get all users

  public static getUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.find();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  public static getUserById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ id: parseInt(req.params.id) });
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  //update user
  public static updateUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ id: parseInt(req.params.id) });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return
      }
      const updatedUser = await userRepo.merge(user, req.body)
      res.status(200).json({ updatedUser, message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  public static deleteUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ id });
      if (!user) {
        res.status(404).json({ message: "user not found" });
        return
      }
      await userRepo.delete(id);
      res.status(200).json({ message: "user deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "server error" });
    }
  };
}
