import express from "express";
import upload from "../middlewares/upload.js";
import { criarAluno, listarAlunos, buscarAlunoPorId, atualizarAluno, atualizarSenhaAluno, excluirAluno } from "../controllers/aluno.controller.js";

const router = express.Router();

// Criar aluno
router.post("/", criarAluno);

// Listar todos os alunos
router.get("/", listarAlunos);

// Buscar aluno por ID
router.get("/:id", buscarAlunoPorId);

router.put("/atualizarCampos/:id", atualizarAluno);

// router.patch("/:id", atualizarAluno);

router.put("/senha/:id", atualizarSenhaAluno);

router.delete("/:id", excluirAluno);

// Atualizar aluno
router.patch("/atualizarImagem/:id", upload.single("imagemPerfil"), async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    // Atualiza campos
    aluno.nome = req.body.nome || aluno.nome;
    aluno.email = req.body.email || aluno.email;

    // Se enviou imagem
    if (req.file) {
      aluno.imagemPerfil = "/uploads/" + req.file.filename; // salva o caminho relativo
    }

    await aluno.save();
    res.json(aluno);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
