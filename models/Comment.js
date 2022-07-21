"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {}
  }
  Comment.init(
    {
      content: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      up: {
        type: DataTypes.INTEGER(30),
        allowNull: true,
        defaultValue: 0,
      },
      down: {
        type: DataTypes.INTEGER(30),
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Comment",
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
    }
  );

  Comment.associate = function (models) {
    Comment.belongsTo(models.Post, {
      foreignKey: "post_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Comment.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Comment.hasMany(models.Recomment, {
      foreignKey: "comment_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Comment.hasMany(models.Recommend,{
      foreignKey: "comment_id",
      sourceKey: "id",
      onDelete: 'cascade',
      onUpdate: 'cascade'});
  };

  return Comment;
};
