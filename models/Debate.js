"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Debate extends Model {
    static associate(models) {}
  }
  Debate.init(
    {
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Debate",
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
    }
  );

  Debate.associate = function (models) {
    Debate.hasMany(models.Post, {
      foreignKey: "debate_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };
  return Debate;
};
