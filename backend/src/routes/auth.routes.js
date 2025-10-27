// src/routes/auth.routes.js
import express from "express";
import { loginAluno, loginUniversidade } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/aluno", loginAluno);
router.post("/universidade", loginUniversidade);

export default router;
