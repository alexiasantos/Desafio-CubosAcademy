const validarRequisicao = (schema) => async (req, res, next) => {
    try {
        const data = await schema.validateAsync(req.body);
        req.body = data;
        next();
    } catch (error) {
        return res.status(400).json({ mensagem: error.message });
    }
}

module.exports = validarRequisicao
