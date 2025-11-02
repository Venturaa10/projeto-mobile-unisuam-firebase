import { Certificado, Universidade } from "../initModels.js";
import fs from "fs";
import { supabase } from "../config/supabase.js";
import path from "path";


export const criarCertificado = async (req, res) => {
  try {
    const { nomeAluno, cpfAluno, matricula, nomeCurso, universidadeId } = req.body;

    let arquivoUrl = null;

   if (req.file) {
  const filePath = req.file.path;
  const originalNameDecoded = decodeURIComponent(req.file.originalname);

  // Gera um nome seguro para o arquivo no Supabase
  const fileName = `${Date.now()}-${originalNameDecoded
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w\-]/g, "")}.pdf`; // adiciona a extensão .pdf explicitamente

  console.log("📄 Nome do arquivo para upload:", fileName);

  // Lê o arquivo como Buffer
  const fileBuffer = fs.readFileSync(filePath);

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "OK" : "Missing");

  // Faz o upload para o bucket "certificados"
  const { data, error: uploadError } = await supabase
    .storage
    .from("certificados")
    .upload(fileName, fileBuffer, {
      contentType: "application/pdf",
    });

console.log("Buckets:", data, "Error:", uploadError);

  // Apaga o arquivo temporário
  fs.unlinkSync(filePath);

  if (uploadError) {
    console.error("❌ Erro ao enviar arquivo para Supabase:", uploadError.message);
    return res.status(500).json({ error: uploadError.message });
  }

  // Gera a URL pública do arquivo
  const { data: publicUrl } = supabase
    .storage
    .from("certificados")
    .getPublicUrl(fileName);

  arquivoUrl = publicUrl.publicUrl;
  console.log("🔗 URL pública gerada:", arquivoUrl);
}


    // Cria o registro no banco
    const certificado = await Certificado.create({
      nomeAluno,
      cpfAluno: cpfAluno.replace(/\D/g, ""),
      matricula,
      nomeCurso,
      dataEmissao: new Date(),
      arquivo: arquivoUrl,
      universidadeId,
    });

    console.log("✅ Certificado criado:", certificado);
    res.status(201).json(certificado);

  } catch (err) {
    console.error("❌ Erro ao criar certificado:", err);
    res.status(400).json({ error: err.message });
  }
};

// Criar certificado local.
// export const criarCertificado = async (req, res) => {
//   try {
//     const { nomeAluno, cpfAluno, matricula, nomeCurso, universidadeId } = req.body;

//     let arquivoUrl = null;

//     // Verifica se veio arquivo
//     if (req.file) {
//       const uploadsDir = path.join(process.cwd(), "backend", "uploads");

//       // Cria a pasta se não existir
//       if (!fs.existsSync(uploadsDir)) {
//         fs.mkdirSync(uploadsDir, { recursive: true });
//       }

//       const originalNameDecoded = decodeURIComponent(req.file.originalname);
//       const fileName = `${Date.now()}-${originalNameDecoded
//         .replace(/\.[^/.]+$/, "")
//         .replace(/\s+/g, "_")
//         .replace(/[^\w\-]/g, "")}.pdf`;

//       const filePath = path.join(uploadsDir, fileName);

//       // Move o arquivo do local temporário para uploads/
//       fs.renameSync(req.file.path, filePath);

//       // URL local (exemplo: http://localhost:3000/uploads/arquivo.pdf)
//       arquivoUrl = `/uploads/${fileName}`;

//       console.log("📄 Arquivo salvo localmente em:", filePath);
//     }

//     // Cria o registro no banco
//     const certificado = await Certificado.create({
//       nomeAluno,
//       cpfAluno: cpfAluno.replace(/\D/g, ""),
//       matricula,
//       nomeCurso,
//       dataEmissao: new Date(),
//       arquivo: arquivoUrl,
//       universidadeId,
//     });

//     console.log("✅ Certificado criado:", certificado);
//     res.status(201).json(certificado);

//   } catch (err) {
//     console.error("❌ Erro ao criar certificado:", err);
//     res.status(400).json({ error: err.message });
//   }
// };

// Listar certificados por CPF
export const listarCertificadosPorCpf = async (req, res) => {
  try {
    const cpf = req.params.cpf.replace(/\D/g, "");

    const certificados = await Certificado.findAll({
      where: { cpfAluno: cpf },
      include: [{ model: Universidade, as: "universidade", attributes: ["id", "nome"] }],
      order: [["dataEmissao", "DESC"]],
    });

    res.json(certificados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar todos os certificados
export const listarTodosCertificados = async (req, res) => {
  try {
    const certificados = await Certificado.findAll();
    res.json(certificados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar privacidade
export const atualizarPrivacidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { publico } = req.body;
    const cert = await Certificado.findByPk(id);
    if (!cert) return res.status(404).json({ error: "Certificado não encontrado" });

    cert.publico = publico;
    await cert.save();
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
