const jwt = require('jsonwebtoken');
const { signupSchema } = require('../middlewares/validator');
const { signinSchema } = require('../middlewares/validator');
const { acceptCodeSchema } = require('../middlewares/validator');
const { acceptFPCodeSchema } = require('../middlewares/validator');
const { changePasswordSchema } = require('../middlewares/validator');
const User = require('../models/usersModel');
const { doHash, doHashValidation, hmacProcess } = require('../utils/hashing');
const transport = require('../middlewares/sendMail');


//Funcao que vai permitir o usario criar conta
exports.signup = async (req, res) => {

    //Pega no corpo da requisicao o email e a password 
    const { userName,email, password } = req.body;
    

    //Faz a validacao do email e password
    try{

        // Faz a validacao do email e password com base no schema de validacao
        const { error, value } = signupSchema.validate({userName,email, password });

        //Se houver erro, retorna o erro
        if(error) {
            return res.status(401).json({ seccess: false, message: error.details[0].message });
        }

       
        //Procura um usuarios com base no email fornecido
        const existingUser = await User.findOne({ email });

        //Verifica se o usuario existe
        if(existingUser) {
            return res.status(401).json({ success: false, message: 'User already exists!'});
        }

        
        //Faz o hash da password
        const hashedPassword = await doHash(password, 12);

        
        //Cria um novo usuario com o email e password fornecidos
        const newUser = new User({
            userName,
            email,
            password: hashedPassword
        });

        //Verifica se o usuario foi criado com sucesso
        const result = await newUser.save();

        //Se o usuario foi criado com sucesso, gera um token
        result.password = undefined;

        //Resposta: Truw
        res.status(201).json({
            success: true, message: 'A sua conta foi criada com sucesso!',
            result
        });

    } catch (error) {
        console.log(error)
    }
};

//Funcao que permite o usuario fazer Login
exports.signin = async (req, res) => {

    //Pega no corpo da requisicao e extrai o email e password
    const { email, password } = req.body;

    //Faz a validacao do email e password
    try {

        // Faz a validacao do email e password com base no schema de validacao
        const { error, value } = signinSchema.validate({ email, password });

        //Se houver erro, retorna o erro
        if (error) {
            return res
                .status(401)
                .json({ seccess: false, message: error.details[0].message });
        }

        //Procura um usuarios com base no email fornecido
        const existingUser = await User.findOne({ email }).select('+password')

        //Verifica se o usuario existe, caso nao exita informa
        if(!existingUser) {
            return res
                .status(401)
                .json({ success: false, message: 'O usuario nao existe. Crie uma conta primeiro!'});
        }

        //Faz a comparacao das palavras sem hash e com hash
        const result = await doHashValidation(password, existingUser.password)

        //Caso nao seja iguais, informa
        if(!result) {
            return res
                .status(401)
                .json({ success: false, message: 'Dados do usuario invalidos!' })
        }

        //Gera o token de acesso
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified
        }, 
        process.env.TOKEN_SECRET, {
            expiresIn: '8h' //8 horas para o token de acesso
        }
    );

    //Configuracao do cookie de acesso
    res.cookie('Authorization', 'Bearer ' + token, { expires: new Date(Date.now() + 8 * 3600000), httpOny: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production'})
    .json({
        success: true,
        token,
        message: 'logged in successfully'
    });

    } catch (error) {
        console.log(error);
    }
};

//Funcao que permite o usuario fazer logout
exports.signout = async (req, res) => {
    res
        .clearCookie('Authorization')
        .status(200)
        .json({ success: true, message: 'logged out successfully' });
};

//Funcao que permite o usuario verificar o email, enviado um codigo de verificacao para o email
exports.sendVerificationCode = async (req, res) => {

    const { email } = req.body;

    try {

        const existingUser = await User.findOne({ email })

        if(!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: 'User does not exists!'});
        }

        if (existingUser.verified) {
            return res
                .status(400)
                .json({ success: false, message: 'You are already verified!'});
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'verification code',
            html: `<h1> ${codeValue} </h1>`
        });

        if(info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERICATION_CODE_SECRET);
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({ success: true, message: 'Code sent!' });
        }

        res.status(400).json({ success: false, message: 'Code sent failed' });

    } catch (error) {
        console.log(error)
    }
};

//Funcao que permite o usuario verificar o codigo de verificacao enviado para o email
exports.verifyVerificationCode = async (req, res) => {

    const { email, providedCode } = req.body;

    try {

        const { error, value } = acceptCodeSchema.validate({ email, providedCode });

        if (error) {
            return res
                .status(401)
                .json({ seccess: false, message: error.details[0].message });
        }

        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({ email }).select('+verificationCode +verificationCodeValidation');

        if(!existingUser) {
            return res
                .status(401)
                .json({ success: false, message: 'User does not exists!'});
        }

        if(existingUser.verified) {
            return res.status(400).json({ success: false, message: 'you are already verified!' });
        }

        if(!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res
                .status(400)
                .json({ success: false, message: 'somethings is wrong with the code!'})
        }

        if(Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            return res
                .status(400)
                .json({ success: false, message: 'code has been expired!' });
        }

        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERICATION_CODE_SECRET);

        if(hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            return res
                .status(200)
                .json({ success: true, message: 'your account has been verified!' });
        }
        return res
                .status(400)
                .json({ success: false, message: 'unexpected occured!' });

    } catch (error) {
        console.log(error)
    }
};

//Funcao que permite o usuario mudar a password
exports.changePassword = async (req, res) => {

    const { userId, verified } = req.user;
    const { oldPassword, newPassword } = req.body;

    try {

        const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword });

        if (error) {
            return res
                .status(401)
                .json({ seccess: false, message: error.details[0].message });
        }

        if (!verified) {
            return res
                .status(401)
                .json({ success: false, message: 'You are not verified user!' });
        }

        const existingUser = await User.findOne({ _id: userId }).select('+password');

        if(!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: 'User does not exists!'});
        }

        const result = await doHashValidation(oldPassword, existingUser.password);

        if (!result) {
            return res
                .status(401)
                .json({ success: false, message: 'Invalid credentials!' });
        }

        const hashedPassword = await doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        await existingUser.save();

        return res
                .status(200)
                .json({ success: true, message: 'Password updated!' });

    } catch (error) {
        console.log(error);
    }
};

//Funcao que permite o usuario fazer logout
exports.sendForgotPasswordCode = async (req, res) => {

    const { email } = req.body;

    try {

        const existingUser = await User.findOne({ email })

        if(!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: 'User does not exists!'});
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Forgot password code',
            html: `<h1> ${codeValue} </h1>`
        });

        if(info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERICATION_CODE_SECRET);
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({ success: true, message: 'Code sent!' });
        }

        res.status(400).json({ success: false, message: 'Code sent failed' });

    } catch (error) {
        console.log(error)
    }
};

//Funcao que permite o usuario verificar o codigo de verificacao enviado para o email
exports.verifyForgotPasswordCode = async (req, res) => {

    const { email, providedCode, newPassword } = req.body;

    try {

        const { error, value } = acceptFPCodeSchema.validate({ email, providedCode, newPassword });

        if (error) {
            return res
                .status(401)
                .json({ seccess: false, message: error.details[0].message });
        }

        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation');

        if(!existingUser) {
            return res
                .status(401)
                .json({ success: false, message: 'User does not exists!'});
        }

        if(!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
            return res
                .status(400)
                .json({ success: false, message: 'somethings is wrong with the code!'})
        }

        if(Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
            return res
                .status(400)
                .json({ success: false, message: 'code has been expired!' });
        }

        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERICATION_CODE_SECRET);

        if(hashedCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save();
            return res
                .status(200)
                .json({ success: true, message: 'password updated!' });
        }
        return res
                .status(400)
                .json({ success: false, message: 'unexpected occured!' });

    } catch (error) {
        console.log(error)
    }
};