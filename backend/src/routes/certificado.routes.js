import express from "express";
import {
  criarCertificado,
  listarCertificadosPorCpf,
  listarTodosCertificados,
  atualizarPrivacidade
} from "../controllers/certificado.controller.js";

import upload from "../middlewares/upload.js"; // importa middleware do multer em memória

const router = express.Router();

// Rotas
router.get("/", listarTodosCertificados);
router.post("/", upload.single("arquivo"), criarCertificado);
router.get("/aluno/:cpf", listarCertificadosPorCpf);
router.patch("/:id/privacidade", atualizarPrivacidade);

export default router;
