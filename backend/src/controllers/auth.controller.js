import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Aluno, Universidade } from "../initModels.js";
import { Op } from "sequelize";
import admin from "../config/firebase.js";

const JWT_SECRET = "sua_chave_super_secreta"; // no futuro usar variável de ambiente



// ==========================================
// LOGIN FIREBASE - ALUNO
// ==========================================
export const loginFirebaseAluno = async (req, res) => {
  try {
    const { tokenFirebase } = req.body;

    if (!tokenFirebase) {
      return res.status(400).json({ error: "Token do Firebase não fornecido" });
    }

    // ✅ Verifica e decodifica o token do Firebase
    const decoded = await admin.auth().verifyIdToken(tokenFirebase);
    const { uid, email, name } = decoded;

    // ✅ Busca aluno pelo e-mail
    let aluno = await Aluno.findOne({ where: { email } });

    // Se não existir, cria automaticamente
    if (!aluno) {
      aluno = await Aluno.create({
        nome: name || "Usuário Firebase",
        email,
      });
    }

    // ✅ Cria token JWT interno
    const token = jwt.sign({ id: aluno.id, tipo: "aluno" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      tipo: "aluno",
      usuario: {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        cpf_cnpj: aluno.cpf,
      },
    });
  } catch (err) {
    console.error("Erro login Firebase Aluno:", err);
    res.status(500).json({ error: "Falha ao autenticar com Firebase" });
  }
};

// ==========================================
// LOGIN FIREBASE - UNIVERSIDADE
// ==========================================
export const loginFirebaseUniversidade = async (req, res) => {
  try {
    const { tokenFirebase } = req.body;

    if (!tokenFirebase) {
      return res.status(400).json({ error: "Token do Firebase não fornecido" });
    }

    // ✅ Verifica o token
    const decoded = await admin.auth().verifyIdToken(tokenFirebase);
    const { uid, email, name } = decoded;

    // ✅ Busca universidade pelo e-mail
    let uni = await Universidade.findOne({ where: { email } });

    if (!uni) {
      uni = await Universidade.create({
        nome: name || "Universidade Firebase",
        email,
      });
    }

    // ✅ Cria token JWT interno
    const token = jwt.sign({ id: uni.id, tipo: "universidade" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      tipo: "universidade",
      usuario: {
        id: uni.id,
        nome: uni.nome,
        email: uni.email,
        cpf_cnpj: uni.cnpj,
      },
    });
  } catch (err) {
    console.error("Erro login Firebase Universidade:", err);
    res.status(500).json({ error: "Falha ao autenticar com Firebase" });
  }
};



// Login apenas para Aluno (email ou CPF)
export const loginAluno = async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) return res.status(400).json({ error: "Informe login e senha" });

    const aluno = await Aluno.findOne({
      where: {
        [Op.or]: [
          { email: login },
          { cpf: login.replace(/\D/g, "") }
        ]
      }
    });

    if (!aluno) return res.status(401).json({ error: "Aluno não encontrado" });

    const senhaValida = await bcrypt.compare(senha, aluno.senha);
    if (!senhaValida) return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: aluno.id, tipo: "aluno" }, JWT_SECRET, { expiresIn: "1d" });

    // Retornando CPF também
    res.json({ 
      token, 
      tipo: "aluno", 
      usuario: { 
        id: aluno.id, 
        nome: aluno.nome, 
        email: aluno.email,
        cpf_cnpj: aluno.cpf 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login apenas para Universidade (email ou CNPJ)
export const loginUniversidade = async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) return res.status(400).json({ error: "Informe login e senha" });

    const uni = await Universidade.findOne({
      where: {
        [Op.or]: [
          { email: login },
          { cnpj: login.replace(/\D/g, "") }
        ]
      }
    });

    if (!uni) return res.status(401).json({ error: "Universidade não encontrada" });

    const senhaValida = await bcrypt.compare(senha, uni.senha);
    if (!senhaValida) return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: uni.id, tipo: "universidade" }, JWT_SECRET, { expiresIn: "1d" });

    // Retornando CNPJ também
    res.json({ 
      token, 
      tipo: "universidade", 
      usuario: { 
        id: uni.id, 
        nome: uni.nome, 
        email: uni.email,
        cpf_cnpj: uni.cnpj 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
