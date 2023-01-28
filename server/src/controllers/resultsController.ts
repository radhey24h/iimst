import { Request, Response } from "express";
import Results from "../models/Results";

export const getAllResults = async (req: Request, res: Response) => {
    const results = await Results.find();
    try {
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({err: error})
    }
}

export const getResultsById = async (req: Request, res: Response) => {
    const { id} = req.params;
    const results = await Results.findById({_id: id});
    try {
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({err: error});
    }
}

export const createResults = async (req: Request, res: Response) => {
    const resultsToCreate = await Results.create(req.body);
    try {
        return res.status(201).json(resultsToCreate);
    } catch (error) {
        return res.status(500).json({msg: "Couldn't create the Results"})
    }
}

export const updateResults = async (req: Request, res: Response) => {
    const { id } = req.params;
    const resultsToUpdate = await Results.findByIdAndUpdate(id, req.body, {new: true})
    try {
        return res.status(202).json(resultsToUpdate);
    } catch (error) {
        return res.status(500).json({msg: "Couldn't update the Results"});
    }
}

export const deleteResults = async (req: Request, res: Response) => {
    const { id } = req.params;
    await Results.findByIdAndDelete(id);
    try {
        return res.status(203).json({message: "deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: "couldn't delete the Results"})
    }
}














