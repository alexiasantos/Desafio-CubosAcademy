const knex = require('../conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaJwt = process.env.JWT_HASH;

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await knex('usuarios').where('email', email).first();

        if (!usuario) {
            return res.status(400).json({ mensagem: 'Email ou senha inválidos.' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(400).json({ mensagem: 'Email ou senha inválidos.' });
        };

        const token = jwt.sign({ id: usuario.id }, senhaJwt, { expiresIn: '5d' });

        const { senha: _, ...usuarioLogado } = usuario;

        return res.status(200).json({
            usuario: usuarioLogado,
            token
        });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    };
};

module.exports = login;
