import { Universidade } from "../initModels.js"; 
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";
import admin from "../config/firebase.js"; // seu firebase-admin

export const criarUniversidade = async (req, res) => {
  try {
    const { uid, nome, cnpj, email, imagemPerfil } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID do Firebase é obrigatório" });
    }

    const existe = await Universidade.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const uni = await Universidade.create({
      uid,
      nome,
      cnpj,
      email,
      imagemPerfil,
    });

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

export const atualizarUniversidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, senha, email, ...dados } = req.body; // pega uid do frontend

    if (!uid) return res.status(400).json({ error: "UID do Firebase é obrigatório" });

    const universidade = await Universidade.findByPk(id);
    if (!universidade) return res.status(404).json({ error: "Universidade não encontrada" });

    // Atualiza Firebase se o email mudou
    if (email && email !== universidade.email) {
      await admin.auth().updateUser(uid, { email });
      dados.email = email; // garante que o banco seja atualizado também
    }

    await universidade.update(dados);

    res.json({ ...universidade.toJSON(), uid });
  } catch (err) {
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

