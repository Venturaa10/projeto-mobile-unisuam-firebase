// src/models/aluno.model.js
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

export default (sequelize, DataTypes) => {
  const Aluno = sequelize.define("Aluno", {
    nome: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING, allowNull: true, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: true },
    googleId: { type: DataTypes.STRING, allowNull: true, unique: true },


    cep: { type: DataTypes.STRING, allowNull: true },
    endereco: { type: DataTypes.STRING, allowNull: true },
    bairro: { type: DataTypes.STRING, allowNull: true },
    estado: { type: DataTypes.STRING, allowNull: true },
  }, {
    hooks: {
      // Antes de criar um novo aluno
beforeCreate: async (aluno) => {
  if (aluno.cpf) {
    aluno.cpf = aluno.cpf.replace(/\D/g, "");
    if (aluno.cpf.length !== 11) throw new Error("CPF deve ter exatamente 11 dígitos");
    const cpfExistente = await Aluno.findOne({ where: { cpf: aluno.cpf } });
    if (cpfExistente) throw new Error("CPF já cadastrado");
  }

  if (aluno.senha) {
    aluno.senha = await bcrypt.hash(aluno.senha, 10);
  }

  const emailExistente = await Aluno.findOne({ where: { email: aluno.email } });
  if (emailExistente) throw new Error("Email já cadastrado");

  if (aluno.googleId) {
    const googleIdExistente = await Aluno.findOne({ where: { googleId: aluno.googleId } });
    if (googleIdExistente) throw new Error("Google ID já cadastrado");
  }
},

beforeUpdate: async (aluno) => {
  // Remove pontuação do CPF só se estiver presente
  if (aluno.cpf) aluno.cpf = aluno.cpf.replace(/\D/g, "");

// Verifica CPF apenas se foi alterado
if (aluno.changed("cpf")) {
  if (aluno.cpf.length !== 11) {
    throw new Error("CPF deve ter exatamente 11 dígitos");
  }
  const cpfExistente = await Aluno.findOne({
    where: { cpf: aluno.cpf, id: { [Op.ne]: aluno.id } }
  });
  if (cpfExistente) throw new Error("CPF já cadastrado");
}

  // Verifica email apenas se foi alterado
  if (aluno.changed("email")) {
    const emailExistente = await Aluno.findOne({
      where: { email: aluno.email, id: { [Op.ne]: aluno.id } }
    });
    if (emailExistente) throw new Error("Email já cadastrado");
  }
}
    }
  });

  return Aluno;
};
