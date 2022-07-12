'use strict';
const { Model } = require('sequelize');
// const { board } = require('./board');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate (models) {
            // define association here
        }
    }
    Comment.init(
        {
            content: {
                type:DataTypes.STRING(500),
                allowNull: false, //필수값
            },
            up: {
                type:DataTypes.INTEGER(30),
                allowNull: true, //필수값,
                defaultValue: 0
            },
            down: {
                type:DataTypes.INTEGER(30),
                allowNull: true, //필수값,
                defaultValue: 0
            },
        },
        {
            sequelize,
            modelName: 'Comment',
            charset: 'utf8',
            collate: 'utf8_general_ci',
            underscored:true
        }
    );

    Comment.associate = function(models){
        Comment.belongsTo(models.Post, {
            foreignKey: "post_id",
            targetKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
        Comment.belongsTo(models.User, {
            foreignKey: "user_id",
            targetKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        })
    };

    return Comment;
};