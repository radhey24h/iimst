import { Schema, model } from 'mongoose';

export interface Results {
    studentId: string;
    semester: number;
    subjectId: number;
    maxMarks: number;
    minMarks: number;
    obtainedMarks:number;
    result: string;
    passYear: string;
}

const ResultsSchema = new Schema<Results>({

    studentId: { type: String, required: true },
    semester: { type: Number, required: true },
    subjectId: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    minMarks: { type: Number, required: true },
    obtainedMarks:{ type: Number, required: true },
    result: { type: String, required: true },
    passYear: { type: String, required: true },
});

export default model<Results>('Result', ResultsSchema)