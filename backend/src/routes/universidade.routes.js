import express from "express";
import upload from "../middlewares/upload.js";
import { criarUniversidade, listarUniversidades, buscarUniversidadePorId, atualizarUniversidade, atualizarSenhaUniversidade, excluirUniversidade, loginGoogleUniversidade } from "../controllers/universidade.controller.js";

const router = express.Router();

router.post("/auth/google/universidade", loginGoogleUniversidade);

// Criar universidade
router.post("/", criarUniversidade);

// Listar todas as universidades
router.get("/", listarUniversidades);

// Buscar universidade por ID
router.get("/:id", buscarUniversidadePorId);

router.put("/atualizarCampos/:id", atualizarUniversidade);

// router.patch("/:id", atualizarUniversidade);

router.put("/senha/:id", atualizarSenhaUniversidade);

router.delete("/:id", excluirUniversidade);

// Atualizar universidade
router.patch("atualizarLogo/:id", upload.single("logo"), async (req, res) => {
  try {
    const uni = await Universidade.findByPk(req.params.id);
    if (!uni) return res.status(404).json({ error: "Universidade não encontrada" });

    uni.nome = req.body.nome || uni.nome;
    uni.email = req.body.email || uni.email;

    if (req.file) {
      uni.logo = "/uploads/" + req.file.filename;
    }

    await uni.save();
    res.json(uni);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


export default router;
