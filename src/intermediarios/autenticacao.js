const knex = require('../conexao');
const jwt = require('jsonwebtoken');
const senhaJwt = process.env.JWT_HASH;

const verificarUsuarioLogado = async (req, res, next) => {
    const {authorization} = req.headers;

    if (!authorization){
        return res.status(401).json({mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }

    const token = authorization.split(' ')[1];
    
    try {

        const {id} = jwt.verify(token, senhaJwt)

        const usuarioExiste = await knex('usuarios').where({ id }).first();

        if (!usuarioExiste) {
            return res.status(404).json({mensagem:'Usuario não encontrado.'});
        }

        const { senha, ...usuario } = usuarioExiste;

        req.usuario = usuario;
		
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' });
        }
        return res.status(500).json({mensagem: 'Erro interno do servidor.'})
    }
}

module.exports = verificarUsuarioLogado