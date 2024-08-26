
import express from "express";
import { healthCheck } from "@handlers";
import { logIn, refreshToken } from "@handlers/Auth";

const router = express.Router();

/* GET home page. */
router.get("/", healthCheck);
router.get("/healthcheck", healthCheck);

// Authentication
router.post("/api/v1/auth/login", logIn);
router.post("/api/v1/auth/token/refresh", refreshToken);


export default router;
