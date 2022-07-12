'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Auth extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate (models) {
            // define association here
        }
    }
    Auth.init(
        {
            code: {
                type:DataTypes.STRING(30),
                allowNull: false, //필수값
            },
            email: {
                type:DataTypes.STRING(50),
                allowNull: false, //필수값
            },
        },
        {
            sequelize,
            modelName: 'EmailAuth',
            charset: 'utf8',
            collate: 'utf8_general_ci',
            underscored:true
        }
    );

    Auth.associate = function(models){
    };

    return Auth;
};