import express from "express";
import { authenticate } from "@/middlewares/authenticate";
import { authenticateAdmin } from "@/middlewares/authenticate-admin";
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/user";
import speciesRoutes from "@/routes/species";
import regionRoutes from "@/routes/region";
import sightingRoutes from "@/routes/sighting";
import questionRoutes from "@/routes/questions";
import tierRoutes from "@/routes/tier";
import moduleRoutes from "@/routes/module";
import reportingRoutes from "@/routes/reporting";
import submissionRoutes from "@/routes/submission";
import notificationRoutes from "@/routes/notifications";
import resourceRoutes from "@/routes/resource";
import reportsRoutes from "@/routes/reports";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", authenticate, userRoutes);
router.use("/species", authenticate, speciesRoutes);
router.use("/region", authenticate, regionRoutes);
router.use("/submission", authenticate, submissionRoutes);
router.use("/reporting", authenticate, reportingRoutes);
router.use("/sighting", authenticate, sightingRoutes);
router.use("/question", authenticate, questionRoutes);
router.use("/tier", authenticate, tierRoutes);
router.use("/module", authenticate, moduleRoutes);
router.use("/notifications", authenticate, notificationRoutes);
router.use("/resource", authenticate, resourceRoutes);
router.use("/reports", authenticateAdmin, reportsRoutes);

export { router };
