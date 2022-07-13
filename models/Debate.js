'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Debate extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate (models) {
            // define association here
        }
    }
    Debate.init(
        {
            title: {
                type:DataTypes.STRING(500),
                allowNull: false, //필수값
            },
            content: {
                type:DataTypes.STRING(500),
                allowNull: false, //필수값
            }
        },
        {
            sequelize,
            modelName: 'Debate',
            charset: 'utf8',
            collate: 'utf8_general_ci',
            underscored:true
        }
    );

    Debate.associate = function(models){
        Debate.hasOne(models.Post, {
            foreignKey: "debate_id",
            sourceKey: "id",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    };

    return Debate;
};