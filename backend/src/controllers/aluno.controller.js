import { Aluno } from "../initModels.js"; 
import bcrypt from "bcryptjs";

// Criar aluno
export const criarAluno = async (req, res) => {
  /**
   * Exemplo de Json para teste.
   * {
  "nome": "Nome aluno",
  "cpf": "123.456.789-00",
  "email": "aluno@example.com",
  "senha": "123456",
  "imagemPerfil": "https://exemplo.com/imagem.jpg"
}
   * 
   */

  try {
    const aluno = await Aluno.create(req.body);
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
    const aluno = await Aluno.findByPk(id);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    // Não permitir atualização de senha diretamente aqui
    const { senha, ...dados } = req.body;

    await aluno.update(dados);
    res.json(aluno);
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
