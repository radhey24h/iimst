import { Router } from 'express';
import { createStudent, deleteStudent, getStudents, getStudentById, updateStudent } from '../controllers/studentController';
const router:Router = Router();

router.get("/", getStudents);
router.get("/student/:id", getStudentById);
router.post("/student", createStudent);
router.put("/student/:id", updateStudent);
router.delete("/student/:id", deleteStudent);

export default router;