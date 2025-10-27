import { Universidade } from "../initModels.js"; 
import bcrypt from "bcryptjs"; 

export const criarUniversidade = async (req, res) => {
  try {
    const uni = await Universidade.create(req.body);
    res.status(201).json(uni);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listarUniversidades = async (req, res) => {
  try {
    const universidades = await Universidade.findAll();
    res.json(universidades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Adicione esta função se quiser buscar por ID
export const buscarUniversidadePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const universidade = await Universidade.findByPk(id);
    if (!universidade) {
      return res.status(404).json({ message: "Universidade não encontrada" });
    }
    res.json(universidade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar universidade
export const atualizarUniversidade = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("ID recebido nos params:", id);
    // console.log("Corpo da requisição (req.body):", req.body);

    const universidade = await Universidade.findByPk(id);
    if (!universidade) {
      // console.log("Universidade não encontrada");
      return res.status(404).json({ error: "Universidade não encontrada" });
    }

    // Bloqueia alteração de senha diretamente aqui
    const { senha, ...dados } = req.body;
    // console.log("Dados que serão atualizados:", dados);

    await universidade.update(dados);
    // console.log("Universidade atualizada com sucesso");
    res.json(universidade);
  } catch (err) {
    // console.error("Erro ao atualizar universidade:", err);
    res.status(400).json({ error: err.message });
  }
};


// Atualizar senha da universidade
export const atualizarSenhaUniversidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ error: "A nova senha é obrigatória" });
    }

    const universidade = await Universidade.findByPk(id);
    if (!universidade) {
      return res.status(404).json({ error: "Universidade não encontrada" });
    }

    const hash = await bcrypt.hash(senha, 10);
    await universidade.update({ senha: hash });

    res.json({ message: "Senha atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Excluir universidade
export const excluirUniversidade = async (req, res) => {
  try {
    const { id } = req.params;
    const universidade = await Universidade.findByPk(id);
    if (!universidade) return res.status(404).json({ error: "Universidade não encontrada" });

    await universidade.destroy();
    res.json({ message: "Universidade excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

