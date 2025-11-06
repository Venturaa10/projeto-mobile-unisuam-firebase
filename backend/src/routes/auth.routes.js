// src/routes/auth.routes.js
import express from "express";
import { loginAluno, loginFirebaseAluno, loginFirebaseUniversidade } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/aluno", loginFirebaseAluno);
router.post("/universidade", loginFirebaseUniversidade);


export default router;
