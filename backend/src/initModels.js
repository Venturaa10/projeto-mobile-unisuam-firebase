// src/initModels.js
import sequelize from "./config/db.js";
import { DataTypes } from "sequelize";
import AlunoModel from "./models/aluno.model.js";
import CertificadoModel from "./models/certificado.model.js";
import UniversidadeModel from "./models/universidade.model.js";

// Inicializa os models
const Aluno = AlunoModel(sequelize, DataTypes);
const Certificado = CertificadoModel(sequelize, DataTypes);
const Universidade = UniversidadeModel(sequelize, DataTypes);

// Configura associações
Aluno.hasMany(Certificado, { foreignKey: "alunoId", as: "certificados" });
Certificado.belongsTo(Aluno, { foreignKey: "alunoId", as: "aluno" });

Universidade.hasMany(Certificado, { foreignKey: "universidadeId", as: "certificadosEmitidos" });
Certificado.belongsTo(Universidade, { foreignKey: "universidadeId", as: "universidade" });

export { sequelize, Aluno, Certificado, Universidade };
