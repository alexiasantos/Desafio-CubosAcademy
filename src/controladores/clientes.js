const knex = require("../conexao");

const cadastrarCliente = async (req, res) => {
    const { nome, email, cpf, cep, rua, numero, bairro, cidade, estado } = req.body;

    try {

        const clienteEmail = await knex('clientes').where({ email }).first();
        if (clienteEmail) {
            return res.status(400).json({ mensagem: "E-mail já existe." });
        }

        const clienteCpf = await knex('clientes').where({ cpf }).first();
        if (clienteCpf) {
            return res.status(400).json({ mensagem: "Cpf já existe." });
        }

        const cliente = await knex('clientes').insert({
            nome,
            email,
            cpf,
            cep,
            rua,
            numero,
            bairro,
            cidade,
            estado
        }).returning('*');
        return res.status(201).json(cliente[0]);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor' });
    }
}
const listarClientes = async (req, res) => {
    try {
        const clientes = await knex('clientes');
        if (clientes.length === 0) {
            return res.status(404).json('Nenhum cliente cadastrado');
        }
        return res.status(200).json(clientes);

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

const detalharCliente = async (req, res) => {
    const { id } = req.params

    if (isNaN(id)) {
        return res.status(400).json({ mensagem: 'Necessário informar um id válido.' });
    }

    try {
        const cliente = await knex('clientes')
            .where({ id })
            .first();

        if (!cliente) {
            return res.status(400).json({ mensagem: 'Cliente não encontrado' });
        }

        return res.status(200).json(cliente);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno no servidor' });
    }
}


const editarCliente = async (req, res) => {
    const { id } = req.params;
    const { nome, email, cpf, cep, rua, numero, bairro, cidade, estado } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ mensagem: 'Necessário informar um id válido.' });
    }

    try {
        const clienteEncontrado = await knex('clientes').where({ id }).first();
        if (!clienteEncontrado) {
            return res.status(404).json({ mensagem: 'Cliente não encontrado' });
        }
        const emailExiste = await knex("clientes")
            .where({ email })
            .whereNot("id", id)
            .first();
        if (emailExiste) {
            return res.status(400).json({ mensagem: "E-mail já existe" });
        }

        const cpfExiste = await knex("clientes")
            .where({ cpf })
            .whereNot("id", id)
            .first();
        if (cpfExiste) {
            return res.status(400).json({ mensagem: "Cpf já existe" });
        }

        const cliente = await knex('clientes').update({
            nome,
            email,
            cpf,
            cep,
            rua,
            numero,
            bairro,
            cidade,
            estado
        }).where(
            { id }
        ).returning('*');

        return res.status(200).json(cliente[0]);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

module.exports = {
    editarCliente,
    listarClientes,
    detalharCliente,
    cadastrarCliente
};
