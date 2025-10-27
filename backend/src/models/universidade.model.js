// src/models/universidade.model.js
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

export default (sequelize, DataTypes) => {
  const Universidade = sequelize.define("Universidade", {
    nome: { type: DataTypes.STRING, allowNull: false },
    cnpj: { type: DataTypes.STRING, allowNull: true, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: true },
    googleId: { type: DataTypes.STRING, allowNull: true, unique: true },

    cep: { type: DataTypes.STRING, allowNull: true },
    endereco: { type: DataTypes.STRING, allowNull: true },
    bairro: { type: DataTypes.STRING, allowNull: true },
    estado: { type: DataTypes.STRING, allowNull: true },
  }, {
    hooks: {
      beforeCreate: async (uni) => {
  if (uni.cnpj) {
    uni.cnpj = uni.cnpj.replace(/\D/g, "");
    if (uni.cnpj.length !== 14) throw new Error("CNPJ deve ter exatamente 14 dígitos");

    const cnpjExistente = await Universidade.findOne({ where: { cnpj: uni.cnpj } });
    if (cnpjExistente) throw new Error("CNPJ já cadastrado");
  }

  if (uni.senha) {
    uni.senha = await bcrypt.hash(uni.senha, 10);
  }

  const emailExistente = await Universidade.findOne({ where: { email: uni.email } });
  if (emailExistente) throw new Error("Email já cadastrado");

  if (uni.googleId) {
    const googleIdExistente = await Universidade.findOne({ where: { googleId: uni.googleId } });
    if (googleIdExistente) throw new Error("Google ID já cadastrado");
  }
},
      beforeUpdate: async (uni) => {
        uni.cnpj = uni.cnpj.replace(/\D/g, "");

      // Valida tamanho do CNPJ apenas se alterado
      if (uni.changed("cnpj") && uni.cnpj.length !== 14) {
        throw new Error("CNPJ deve ter exatamente 14 dígitos");
      }

      // Valida CNPJ único ignorando o próprio registro
      if (uni.changed("cnpj")) {
        const cnpjExistente = await Universidade.findOne({ 
          where: { cnpj: uni.cnpj, id: { [Op.ne]: uni.id } } 
        });
        if (cnpjExistente) throw new Error("CNPJ já cadastrado");
      }

        // Valida email único ignorando o próprio registro
        const emailExistente = await Universidade.findOne({ 
          where: { email: uni.email, id: { [Op.ne]: uni.id } } 
        });
        if (emailExistente) throw new Error("Email já cadastrado");
      }
    }
  });

  return Universidade;
};
