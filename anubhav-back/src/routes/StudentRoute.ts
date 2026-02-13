import { Router } from 'express';
import express from 'express';
import StudentController from '../controller/StudentController';

const router = express.Router();


router.get('/',StudentController.getStudent);


router.post('/',StudentController.addStudent);



router.get('/:id',StudentController.getOneStudent); 


router.put('/:id',StudentController.updateCourse);


router.delete('/:id',StudentController.deleteStudent); 

export default router;

