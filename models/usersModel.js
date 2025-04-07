const mongoose = require('mongoose')

//Modelo de usuario a ser armazenado no banco de dados
const userSchema = mongoose.Schema({

    //Nome do usuario
    userName: {
        type: String,
        required: [true, 'Username is required!'],
        trim: true,
        unique: [true, 'Username must be unique!'],
        minLength: [5, 'Username must have 5 characters!']
    },
    //Email do usuario
    email: {
        type: String,
        require: [true, 'Email is required!'],
        trim: true,
        unique: [true, 'Email must be unique!'],
        minLength: [5, 'Email must have 5 characters!'],
        lowercase: true
    },
    //Nivel de acesso
    rol:{
        type: String,
        enum: ['admin', 'user'],
        default: 'admin'
    },
    //Senha do usuario
    password: {
        type: String,
        required: [true, 'Password must be provided!'],
        trim: true,
        select: false
    },
    //Se esta verificado ou não
    verified: {
        type: Boolean,
        default: false
    },
    //Codigo de verificação
    verificationCode: {
        type: String,
        select: false
    },
    //Validacao do codigo de verificação
    verificationCodeValidation: {
        type: Number,
        select: false
    },
    //Se o codigo do  forgotPassword esta correto
    forgotPasswordCode: {
        type: String,
        select: false
    },
    //Validacao do codigo do forgotPassword
    forgotPasswordCodeValidation: {
        type: Number,
        select: false
    }
}, {
    //Timestamps
    timestamps: true
});

//Exportando o modelo de usuario
module.exports = mongoose.model('User', userSchema)