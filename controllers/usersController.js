const User = require('../models/usersModel'); // Ajuste o caminho conforme necessário

// Função para listar todos os usuários
exports.listAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // 'User.find()' retorna todos os usuários da coleção

    // Retorna a lista de usuários
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar os usuários',
      error: error.message
    });
  }
};

//Funcao para pesquisar usuario pelo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ 
      success: true,
      user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Funcao para editar usuario
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Funcao para apagar usuario
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


