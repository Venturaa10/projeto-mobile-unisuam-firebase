// src/config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// const sequelize = new Sequelize("projeto_mobile_unisuam", "postgres", "crase", {
//   host: "1.0.90.90",
//   dialect: "postgres",
//   port: 5432,
//   logging: false,
// });


// const sequelize = new Sequelize("projeto_mobile_unisuam", "postgres", "123456", {
//   host: "localhost",
//   dialect: "postgres",
//   port: 5432,
//   logging: false,
// });



const sequelize = new Sequelize(
  process.env.DB_NAME,     // Nome do banco
  process.env.DB_USER,     // Usuário
  process.env.DB_PASSWORD, // Senha
  {
    host: process.env.DB_HOST, // Host do banco
    dialect: "postgres",
    port: process.env.DB_PORT || 5432, // Porta (padrão 5432)
    logging: false,
  }
);
export default sequelize;