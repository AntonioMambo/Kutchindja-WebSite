const  mongoose = require('mongoose')

// Schema do post para armazenar os dados no banco de dados
const postSchema = mongoose.Schema({

    //Titulo do post
    title: {
        type: String,
        required: [true, 'title is required!'],
        trim: true
    },
    //Descricao do post
    description: {
        type: String,
        required: [true, 'description is required!'],
        trim: true
    },
    //Imagem do post
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    //Data de criacao do post
    datePost:{
        type: Date,
        default: Date.now
    },
    //Data de atualizacao do post
    dateUpdate:{
        type: Date        
    },
    //data de exclusao do post
    dateDelete:{
        type: Date
    },
    postImage: {
        type: String,
        required: [true, 'postImage is required!'],
        trim: true
    },
    images: {
        type: Array,
        default: []
    },
    assets:{
        type: Array,
        default: []
    },
     destaque: {
        type: Boolean,
        default: false
    },
    tipo:{
        type: String,
        emun: ['noticias', 'artigos', 'comunicados', 'projetos', 'sensibilizacao', 'relatorios', 'testemunhos', 'materias educativos'],
        default: 'artigos'
    }
}, {timestamps: true});


//Exportando o modelo do post
module.exports = mongoose.model('Post', postSchema);