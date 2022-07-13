"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {}
  }
  Post.init(
    {
      title: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      hit: {
        type: DataTypes.INTEGER(30),
        allowNull: true,
        defaultValue: 0,
      },
      opinion: {
        type: DataTypes.INTEGER(30),
        allowNull: false,
        defaultValue: 0,
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
      modelName: "Post",
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
    }
  );

  Post.associate = function (models) {
    Post.belongsTo(models.User, {
      foreignKey: "user_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Post.belongsTo(models.Board, {
      foreignKey: "board_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Post.belongsTo(models.Debate, {
      foreignKey: "debate_id",
      targetKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    Post.hasMany(models.Comment, {
      foreignKey: "post_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };
  return Post;
};
