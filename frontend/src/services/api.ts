import axios from "axios";

// Define a tipagem do retorno do login
export interface LoginResponse {
  token: string;
  tipo: "aluno" | "universidade";
  usuario: {
    id: number;
    nome: string;
    email: string;
    uid: string;
  };
}

// Para testar na web na propria maquina
// // Cria instância do Axios
// const api = axios.create({
//   baseURL: "http://localhost:3000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const api = axios.create({
//   baseURL: "http://192.168.1.74:3000/api", // IP na rede local no windows em casa
//   headers: {
//     "Content-Type": "application/json",
//   },
// });


// const api = axios.create({
//   baseURL: "http://1.0.11.21:3000/api", // IP na rede local no mac no trabalho
//   headers: {
//     "Content-Type": "application/json",
//   },
// });


// const api = axios.create({
//   baseURL: "https://projeto-mobile-unisuam.onrender.com/api",
//   headers: { "Content-Type": "application/json" },
// });

const api = axios.create({
  baseURL: "https://projeto-mobile-unisuam-firebase.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
