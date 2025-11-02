// src/routes/auth.routes.js
import express from "express";
import { loginAluno, loginUniversidade } from "../controllers/auth.controller.js";
import { loginGoogleAluno } from "../controllers/aluno.controller.js";
import { loginGoogleUniversidade } from "../controllers/universidade.controller.js";


const router = express.Router();

router.post("/aluno", loginAluno);
router.post("/universidade", loginUniversidade);

router.post("/google/aluno", loginGoogleAluno);
router.post("/google/universidade", loginGoogleUniversidade);

export default router;
