"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Reply extends Model {
    static associate(models) {}
  }
  Reply.init(
    {
      content: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reply",
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
    }
  );

  Reply.associate = function (models) {
    Reply.belongsTo(models.Comment, {
      foreignKey: "comment_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Reply.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };

  return Reply;
};
