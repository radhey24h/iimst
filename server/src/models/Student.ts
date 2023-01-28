import { Schema, model } from 'mongoose';

export interface Student {
    name: string;
    fatherName: string;
    motherName: string;
    email: string;
    course: string;
    dateOfBirth: Date | string;
    address: string;
    rollNumber: string;
    password: string;
    isActive: boolean;
}

const StudentSchema = new Schema<Student>({
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    email: { type: String, required: true },
    course: { type: String, required: true },
    address: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    rollNumber: { type: String, required: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, required: true }
});

export default model<Student>('Student', StudentSchema)