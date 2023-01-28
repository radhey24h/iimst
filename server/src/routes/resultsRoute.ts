import { Router } from 'express';
import { createResults, deleteResults, getAllResults, getResultsById, updateResults } from '../controllers/resultsController';
const router:Router = Router();

router.get("/", getAllResults);
router.get("/results/:id", getResultsById);
router.post("/results", createResults);
router.put("/results/:id", updateResults);
router.delete("/results/:id", deleteResults);

export default router;