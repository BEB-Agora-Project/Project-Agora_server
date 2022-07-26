"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Post.init(
    {
      title: {
        type: DataTypes.STRING(30),
        // 자주사용되는 자료형 STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
        allowNull: false, //필수값
      },
      content: {
        type: DataTypes.TEXT("long"),
        allowNull: false, //필수값
      },
      hit: {
        type: DataTypes.INTEGER(30),
        allowNull: true, //필수값,
        defaultValue: 0,
      },
      opinion: {
        type: DataTypes.INTEGER(30),
        allowNull: false, //필수값,
        defaultValue: 0,
      },
      up: {
        type: DataTypes.INTEGER(30),
        allowNull: true, //필수값,
        defaultValue: 0,
      },
      down: {
        type: DataTypes.INTEGER(30),
        allowNull: true, //필수값,
        defaultValue: 0,
      },
      has_image: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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
    Post.hasMany(models.Recommend, {
      foreignKey: "post_id",
      sourceKey: "id",
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  };
  return Post;
};
