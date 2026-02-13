import { NextFunction, Response } from "express";
import { AppDataSource } from "../Config/dbConfig";
const jwt = require("jsonwebtoken");

const verifyToken = (req:any , res: Response, next: NextFunction) => {
    try{
        if(req.headers && req.headers.authorization){
            const token = req.headers.authorization.split(" ")[1];
            if(!token){
                return res.status(403).json('a token is required for authentication')
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if(!decoded){ return res.status(401).json('Invalid Token') }
            const user = AppDataSource.getRepository("User").findOne({
                where: {
                    id: decoded.userId
                }
            });
            req.user = user;
            next()
        }else{
            return res.status(403).json('a token is required for authentication')
        }
    }catch(err){
        return res.status(401).json({
            message: "Unauthorized",
            error: err
        })
    }
}
export default verifyToken;