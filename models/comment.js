'use strict';
const { Model } = require('sequelize');
// const { board } = require('./board');
module.exports = (sequelize, DataTypes) => {
    class comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate (models) {
            // define association here
        }
    }
    comment.init(
        {
            content: {
                type:DataTypes.STRING(500),
                allowNull: false, //필수값
            },
        },
        {
            sequelize,
            modelName: 'comment',
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    comment.associate = function(models){
        comment.belongsTo(models.board, {
            foreignKey: "boardId",
            targetKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
        comment.belongsTo(models.user, {
            foreignKey: "userId",
            targetKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        })
    };

    return comment;
};