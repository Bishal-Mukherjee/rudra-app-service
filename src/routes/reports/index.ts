import express from "express";
import { generateReport } from "@/controllers/reports";

const router = express.Router();

router.post("/generate", generateReport);

export default router;
