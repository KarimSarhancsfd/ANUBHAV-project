import { Router } from "express";
import UserRoute from "./UserRoute";
import GroupRateRoute from "./GroupRateRoute";
import UserAttachRoute from "./UserAttachRoute";
import GroupRoute from "./GroupRoute"
import CourseRoute from "./CourseRoute";
import UserGroupRoute from "./UserGroupRoute"
import CategoryRoute from './CategoryRoute'
import  InvoiceRoute from "./InvoiceRoute"
import LectureRoute from "./LectureRoute";
import StudentRoute from "./StudentRoute";
import InstructorRoute from "./InstructorRateRoute";


const router = Router();

router.use("/user", UserRoute);
router.use("/group-rates", GroupRateRoute)
router.use("/userAttach", UserAttachRoute);
router.use("/group", GroupRoute)
router.use("/userGroup", UserGroupRoute);
router.use("/course", CourseRoute);
router.use("/category", CategoryRoute);
router.use("/invoice" , InvoiceRoute ); 
router.use("/Lecture", LectureRoute);
router.use("/student", StudentRoute );
router.use("/instructor", InstructorRoute);


export default router;