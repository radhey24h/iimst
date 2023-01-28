import { Request, Response } from "express";
import Student from "../models/Student";

export const getStudents = async (req: Request, res: Response) => {
    const students = await Student.find();
    console.log(students)
    try {
        return res.status(200).json(students);
    } catch (error) {
        return res.status(500).json({err: error})
    }
}

export const getStudentById = async (req: Request, res: Response) => {
    const { id} = req.params;
    const student = await Student.findById({_id: id});
    try {
        return res.status(200).json(student);
    } catch (error) {
        return res.status(500).json({err: error});
    }
}

export const createStudent = async (req: Request, res: Response) => {
    const studentToCreate = await Student.create(req.body);
    try {
        return res.status(201).json(studentToCreate);
    } catch (error) {
        return res.status(500).json({msg: "Couldn't create the Student"})
    }
}

export const updateStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentToUpdate = await Student.findByIdAndUpdate(id, req.body, {new: true})
    try {
        return res.status(202).json(studentToUpdate);
    } catch (error) {
        return res.status(500).json({msg: "Couldn't update the Student"});
    }
}

export const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    await Student.findByIdAndDelete(id);
    try {
        return res.status(203).json({message: "deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: "couldn't delete the Student"})
    }
}














