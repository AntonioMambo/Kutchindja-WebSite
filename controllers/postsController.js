const { createPostSchema, editPostSchema } = require('../middlewares/validator');
const Post = require('../models/postsModel');



//Funcao que vai criar um novo post
exports.createPost = async (req, res) => {  
    
    // Desestruturação dos dados do corpo da requisição
    const {
        title,
        description,
        postImage,
        images,
        assets,
        destaque,
        tipo
    } = req.body;

    const { userId } = req.user;
 
    const tipoDePost= ['noticias', 'artigos', 'comunicados', 'projetos', 'sensibilizacao', 'relatorios', 'testemunhos', 'materias educativos'];

    // Verifica se o tipo de post é válido
    if (!tipoDePost.includes(tipo)) {
        return res.status(400).json({
            success: false,
            message: 'Tipo de post inválido. Os tipos válidos são: ' + tipoDePost.join(', ')
        });
    }   
    
    try {
        // Validação com Joi (exemplo, personaliza como quiser)
        const { error, value } = createPostSchema.validate({
            title,
            description,
            postImage,
            userId,
            tipo,
            destaque
        });

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        // Criação do post
        const result = await Post.create({
            title,
            description,
            postImage,
            userId,
            images: images || [],
            assets: assets || [],
            destaque: destaque || false,
            tipo: tipo || 'artigos'
        });

        res.status(201).json({
            success: true,
            message: 'Post criado com sucesso!',
            data: result
        });



    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar o post',
            error: error.message
        });
    }
};


// Função que vai editar um post existente
exports.editPost = async (req, res) => {
    const { id } = req.params; // ID do post a ser editado
    const { userId } = req.user; // ID do usuário autenticado
    console.log (userId);

    // Desestruturação dos dados do corpo da requisição
    const {
        title,
        description,
        postImage,
        images,
        assets,
        destaque,
        tipo
    } = req.body;

    
    // Array de tipos de post válidos
    const tipoDePost = [
        'noticias',
        'artigos',
        'comunicados',
        'projetos',
        'sensibilizacao',
        'relatorios',
        'testemunhos',
        'materias educativos'
    ];

    // Verifica se o tipo de post é válido
    if (tipo && !tipoDePost.includes(tipo)) {
        return res.status(400).json({
            success: false,
            message: 'Tipo de post inválido. Os tipos válidos são: ' + tipoDePost.join(', ')
        });
    }

    try {
        // Validação parcial com Joi (só os campos obrigatórios aqui)
        const { error } = editPostSchema.validate({
            title,
            description,
            postImage,
            userId,
            tipo: tipo || 'artigos',
            destaque: destaque || false
        });

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message });
        }

        // Procura o post e atualiza
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                title,
                description,
                postImage,
                images: images || [],
                assets: assets || [],
                destaque: destaque || false,
                tipo: tipo || 'artigos',
                dateUpdate: new Date()
            },
            { new: true } // Retorna o novo documento atualizado
        );

        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado!'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Post atualizado com sucesso!',
            data: updatedPost
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar o post',
            error: error.message
        });
    }
};

// Função que apaga um post (remoção lógica)
exports.deletePost = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        // Verifica se o post existe e pertence ao utilizador autenticado
        const post = await Post.findOne({ _id: id, userId });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado ou não pertence ao utilizador.'
            });
        }

        // Atualiza o campo dateDelete (remoção lógica)
        post.dateDelete = new Date();
        await post.save();

        res.status(200).json({
            success: true,
            message: 'Post apagado com sucesso (remoção lógica).',
            data: post
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Erro ao apagar o post',
            error: error.message
        });
    }
};


//Funcao para listar todos os posts
exports.listAllPosts = async (req, res) => {
  try {
    const posts = await Post.find(); // 'User.find()' retorna todos os usuários da coleção

    // Retorna a lista de usuários
    res.status(200).json({
      success: true,
      posts: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar os posts!',
      error: error.message
    });
  }
};

//Funcao para listar todos os posts
exports.listAllPostsLogic = async (req, res) => {
    try {
      const posts = await Post.find({dateDelete: null}); // 'User.find()' retorna todos os usuários da coleção
  
      // Retorna a lista de usuários
      res.status(200).json({
        success: true,
        posts: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar os posts!',
        error: error.message
      });
    }
  };
  

//Funcao para listar posts por tipo
exports.listByType = async (req, res) => {

    //Pega o tipo de post no corpo da requisicao
    const { tipo } = req.body;

    try {
      const posts = await Post.find({tipo}); // 'User.find()' retorna todos os usuários da coleção
        
      //Verificar se existe algum post desse tipo
      if (!posts || posts.length === 0) {
        return res.status(400).json({ error: "Nao existe nenhum post com o tipo " + tipo });
    }  
      // Retorna a lista de posts
      res.status(200).json({
        success: true,
        posts: posts
      });
 
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar os posts!',
        error: error.message
      });
    }
  };

//Funcao que permite listar todos os posts
exports.getPosts = async (req, res) => {
    const { page } = req.body;
    const postsPerPage = 10;

    try {

        let pageNum = 0;

        if(page <= 1) {
            pageNum = 0;
        } else {
            pageNum = page - 1;
        }

        const result = await Post.find()
            .sort({createAt: -1})
            .skip(pageNum * postsPerPage)
            .limit(postsPerPage)
            .populate({
                path: 'userId',
                select: 'email'
            });

        res.status(200).json({ success: true, message: 'posts', data: result });

    } catch (error) {
        console.log(error);
    }
};

exports.singlePost = async (req, res) => {

    const { _id } = req.query;

    try {

        const existingPost = await Post.findOne({ _id })
            .populate({
                path: 'userId',
                select: 'email'
            });

        if(!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: 'Post unavailable' })
        }

        res.status(200).json({ success: true, message: 'single post', data: existingPost });

    } catch (error) {
        console.log(error);
    }
};



//Funcao para apagar post
exports.deletePost = async (req, res) => {

    const { _id } = req.query;
    const { userId } = req.user;

    try{

        const existingPost = await Post.findOne({ id: _id, userId });
        
        // Verifica se o post existe e pertence ao utilizador autenticado
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado ou não pertence ao utilizador.'
            });
        }

        // Atualiza o campo dateDelete (remoção lógica)
        existingPost.dateDelete = new Date();
        await existingPost.save();

        res.status(200).json({
            success: true,
            message: 'Post apagado com sucesso (remoção lógica).',
            data: existingPost
        });  



    } catch (error) {
        console.log(error);
    }
};