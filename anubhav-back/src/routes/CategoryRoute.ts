import express from 'express'
import CategoryController from '../controller/CategoryController'
import { addCategory, updateCategory } from '../request/CourseRequest'
import requestValidator from '../middleware/RequestValidate'

const router = express.Router()


router.get('/', CategoryController.getAllCategory)
router.get('/:id', CategoryController.getOneCategory)
router.post('/', requestValidator(addCategory), CategoryController.createCategory)
router.delete('/:id', CategoryController.deleteCategory)
router.patch('/:id', requestValidator(updateCategory), CategoryController.updatedCategory)



export default router