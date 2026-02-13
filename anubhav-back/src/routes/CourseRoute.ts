import express from 'express'
import CourseController from '../controller/CourseController'
import requestValidator from '../middleware/RequestValidate'
import { addCourseRequest, updateCourseRequest } from '../request/CourseRequest'

const router = express.Router()

router.get('/', CourseController.getCourse)
router.get('/:id', CourseController.getOneCourse)
router.post('/', requestValidator(addCourseRequest), CourseController.addCourse)
router.delete('/:id', CourseController.deleteCourse)
router.patch('/:id', requestValidator(updateCourseRequest), CourseController.updateCourse)

export default router;

