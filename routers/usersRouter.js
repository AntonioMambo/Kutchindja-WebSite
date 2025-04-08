const express = require('express');
const authController = require('../controllers/authController');
const { identifier } = require('../middlewares/identification');
const router = express.Router();
const users= require('../controllers/usersController');

router.get('/allUsers', identifier,users.listAllUsers); // Rota para listar todos os usuários
router.get('/getById', identifier,users.listAllUsers); // Rota para listar usuario com base no ID
router.put('/:id',identifier, users.updateUser);       //Rota para atualizar usuario
router.delete('/:id',identifier, users.deleteUser);    // Rota para apagar usuario




module.exports = router;