import express, { Application } from 'express';
import cors from 'cors';
import "dotenv/config";
// here we'll import routes;
import resultsRoute from './routes/resultsRoute';
import studentRoute from './routes/studentRoute';


const app: Application = express();

// middlewares
app.use(express.json());
app.use(cors())

// here we will declare the routes paths
app.use("/api/results", resultsRoute);
app.use("/api/student", studentRoute);

export { app }
