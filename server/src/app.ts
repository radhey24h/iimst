import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import "dotenv/config";

const app:Application = express();

// middlewares
app.use(express.json());
app.use(cors())

// here we'll import routes;
import gameRoute from './routes/gameRoute';
import resultsRoute from './routes/resultsRoute';
import studentRoute from './routes/studentRoute';
// here we will declare the routes paths
app.use("/api/games", gameRoute);
app.use("/api/results", resultsRoute);
app.use("/api/student", studentRoute);

export {app}
