const knex = require("../conexao");
const bcrypt = require("bcrypt");

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const usuarioEncontrado = await knex("usuarios").where({ email }).first();

    if (usuarioEncontrado) {
      return res.status(400).json({ mensagem: "E-mail já existe." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await knex("usuarios")
      .insert({
        nome,
        email,
        senha: senhaCriptografada,
      })
      .returning("*");

    const { senha: _, ...novoUsuario } = usuario[0];

    return res.status(200).json(novoUsuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const detalharPerfil = async (req, res) => {
  return res.status(200).json(req.usuario);
};

const editarPerfil = async (req, res) => {
  const { id } = req.usuario;
  const { nome, email, senha } = req.body;

  try {
    const emailExiste = await knex("usuarios")
      .where({ email })
      .whereNot("id", id)
      .first();
    if (emailExiste) {
      return res.status(400).json({ mensagem: "E-mail já existe" });
    }
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const usuario = await knex("usuarios")
      .where({ id })
      .update({
        nome,
        email,
        senha: senhaCriptografada,
      })
      .returning("*");
    const { senha: _, ...novoUsuario } = usuario[0];
    return res.status(200).json(novoUsuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

module.exports = { detalharPerfil, cadastrarUsuario, editarPerfil };
