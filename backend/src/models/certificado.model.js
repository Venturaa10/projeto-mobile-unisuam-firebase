export default (sequelize, DataTypes) => {
  const Certificado = sequelize.define("Certificado", {
    nomeAluno: { type: DataTypes.STRING, allowNull: false },
    cpfAluno: { type: DataTypes.STRING, allowNull: false },
    matricula: { type: DataTypes.STRING, allowNull: true },
    nomeCurso: { type: DataTypes.STRING, allowNull: false },
    dataEmissao: { type: DataTypes.DATE, allowNull: false },
    arquivo: { type: DataTypes.STRING, allowNull: true },
    publico: { type: DataTypes.BOOLEAN, defaultValue: false },
    universidadeId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    hooks: {
      beforeCreate: (certificado) => {
        certificado.cpfAluno = certificado.cpfAluno.replace(/\D/g, "");
      },
      beforeUpdate: (certificado) => {
        certificado.cpfAluno = certificado.cpfAluno.replace(/\D/g, "");
      }
    }
  });

  Certificado.associate = (models) => {
    Certificado.belongsTo(models.Universidade, {
      foreignKey: "universidadeId",
      as: "universidade",
    });
  };

  return Certificado;
};
