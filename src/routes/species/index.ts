import express from "express";
import { getSpecies } from "@/controllers/species";

const router = express.Router();

router.get("/", getSpecies);

export default router;
