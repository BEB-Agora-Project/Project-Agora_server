"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Recomment extends Model {
    static associate(models) {}
  }
  Recomment.init(
    {
      content: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Recomment",
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
    }
  );

  Recomment.associate = function (models) {
    Recomment.belongsTo(models.Comment, {
      foreignKey: "comment_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Recomment.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };

  return Recomment;
};
