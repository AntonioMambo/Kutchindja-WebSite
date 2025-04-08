const Joi = require('joi');

exports.signupSchema = Joi.object({
    userName: Joi.string()
        .min(5)
        .trim()
        .required()
        .messages({
            'string.base': 'Username must be a string!',
            'string.empty': 'Username is required!',
            'string.min': 'Username must have 5 characters!',
            'any.required': 'Username is required!',
        }),
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ['com', 'net'] }
        }),
        password: Joi.string()
            .required()
            .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'))
});

exports.signinSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ['com', 'net'] }
        }),
    password: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'))
});

exports.acceptCodeSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ['com', 'net'] }
        }),
    providedCode: Joi.number().required()
});

exports.changePasswordSchema = Joi.object({
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$')),
    oldPassword: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'))
});

exports.acceptFPCodeSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: { allow: ['com', 'net'] }
        }),
    providedCode: Joi.number().required(),
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'))
});

exports.createPostSchema = Joi.object({
    title: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'O título é obrigatório.',
            'any.required': 'O título é obrigatório.'
        }),
    description: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'A descrição é obrigatória.',
            'any.required': 'A descrição é obrigatória.'
        }),
    postImage: Joi.string()
        .uri()
        .trim()
        .required()
        .messages({
            'string.empty': 'A imagem principal é obrigatória.',
            'string.uri': 'A imagem principal deve ser uma URL válida.',
            'any.required': 'A imagem principal é obrigatória.'
        }),
    images: Joi.array()
        .items(Joi.string().uri().trim())
        .messages({
            'array.base': 'As imagens devem ser fornecidas em um array.',
            'string.uri': 'Cada imagem deve ser uma URL válida.'
        }),
    assets: Joi.array()
        .items(Joi.string().uri().trim())
        .messages({
            'array.base': 'Os assets devem ser fornecidos em um array.',
            'string.uri': 'Cada asset deve ser uma URL válida.'
        }),
    destaque: Joi.boolean()
        .default(false)
        .messages({
            'boolean.base': 'O campo destaque deve ser verdadeiro ou falso.'
        }),
    tipo: Joi.string()
        .valid('noticias', 'artigos', 'comunicados', 'projetos', 'sensibilizacao', 'relatorios', 'testemunhos', 'materiais educativos')
        .default('artigos')
        .messages({
            'any.only': 'O tipo deve ser um dos seguintes: noticias, artigos, comunicados, projetos, sensibilizacao, relatorios, testemunhos, materiais educativos.'
        }),
    userId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.empty': 'O ID do usuário é obrigatório.',
            'string.pattern.base': 'O ID do usuário deve ser um ObjectId válido.',
            'any.required': 'O ID do usuário é obrigatório.'
        })
});

exports.editPostSchema = Joi.object({
    title: Joi.string().trim(),
    description: Joi.string().trim(),
    postImage: Joi.string().trim(),
    tipo: Joi.string().valid(
      'noticias',
      'artigos',
      'comunicados',
      'projetos',
      'sensibilizacao',
      'relatorios',
      'testemunhos',
      'materias educativos'
    ),
    destaque: Joi.boolean(),
    images: Joi.array(),
    assets: Joi.array()
  });
  