import { Router } from "express";
import CourseRateController from "../controller/CourseRateController";
import { addCourseRequest } from "../request/CourseRequest";


const router = Router();

router.get("/",CourseRateController.getCourseRate);
router.get("/:id",CourseRateController.getCourseRateById);
router.post("/", CourseRateController.addCourseRate)
router.put("/:id" , CourseRateController.updateCourseRate)
router.delete("/:id", CourseRateController.deleteCourseRate);