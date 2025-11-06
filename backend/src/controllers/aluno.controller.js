import { Aluno } from "../initModels.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "../config/firebase.js"; // seu firebase-admin


export const criarAluno = async (req, res) => {
  try {
    const { uid, nome, cpf, email, imagemPerfil } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID do Firebase é obrigatório" });
    }

    // Evita duplicar usuário
    const existe = await Aluno.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const aluno = await Aluno.create({
      uid, // chave Firebase
      nome,
      cpf,
      email,
      imagemPerfil,
    });

    res.status(201).json(aluno);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



// Listar todos os alunos
export const listarAlunos = async (req, res) => {
  try {
    const alunos = await Aluno.findAll();
    res.json(alunos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar aluno por ID
export const buscarAlunoPorId = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });
    res.json(aluno);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar aluno

export const atualizarAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, senha, ...dados } = req.body; // ✅ inclui uid

    if (!uid) return res.status(400).json({ error: "UID do Firebase é obrigatório" });

    // Atualiza no Firebase primeiro
    if (dados.email) {
      await admin.auth().updateUser(uid, { email: dados.email });
    }
    // Se quiser atualizar senha
    if (senha) {
      await admin.auth().updateUser(uid, { password: senha });
    }

    // Atualiza no banco local
    const aluno = await Aluno.findByPk(id);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    await aluno.update(dados);

    res.json({ ...aluno.toJSON(), uid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Atualizar senha do aluno
export const atualizarSenhaAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ error: "A nova senha é obrigatória" });
    }

    const aluno = await Aluno.findByPk(id);
    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Hash da senha
    const hash = await bcrypt.hash(senha, 10);
    await aluno.update({ senha: hash });

    res.json({ message: "Senha atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Excluir aluno
export const excluirAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const aluno = await Aluno.findByPk(id);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    await aluno.destroy();
    res.json({ message: "Aluno excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
