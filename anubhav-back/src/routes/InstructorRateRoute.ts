import express from 'express'
import Instructor from '../controller/InstructorRateController'
import requestValidator from '../middleware/RequestValidate'
import { addInstructorRate, updateInstructorRate } from '../request/InstructorRateRequest'


const router = express.Router()


router.get('/', Instructor.getAllInstructors)
router.get('/:id', Instructor.getOneInstructor)
router.post('/', requestValidator(addInstructorRate), Instructor.addInstructor)
router.delete('/:id', Instructor.deleteInstructorRate)
router.patch('/:id', requestValidator(updateInstructorRate), Instructor.updatedInstructorRate)


export default router