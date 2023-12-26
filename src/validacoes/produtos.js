const joi = require("joi");

const produtoSchema = joi.object({
  descricao: joi.string().required().trim().messages({
    'any.required': 'O campo descricao é obrigatório.',
    'string.empty': 'O campo descricao é obrigatório.',
    'string.base': 'O campo descricao deve ser uma string.'
  }),
  quantidade_estoque: joi.required().messages({
    'any.required': 'O campo quantidade_estoque é obrigatório.',
    'number.empty': 'O campo quantidade_estoque é obrigatório.',
    'number.base': 'O campo quantidade_estoque deve ser um número inteiro.',
    'number.integer': 'O campo quantidade_estoque deve ser um número inteiro.',
    'number.min': 'O campo quantidade_estoque deve ser um número inteiro igual ou maior que zero.'
  }).options({ convert: false }),
  valor: joi.required().messages({
    'any.required': 'O campo valor é obrigatório.',
    'number.empty': 'O campo valor é obrigatório.',
    'number.base': 'O campo valor deve ser um número inteiro.',
    'number.integer': 'O campo valor deve ser um número inteiro.',
    'number.min': 'O campo valor deve ser um número inteiro maior que zero.'
  }).options({ convert: false }),
  categoria_id: joi.required().messages({
    'any.required': 'O campo categoria_id é obrigatório.',
    'number.empty': 'O campo categoria_id é obrigatório.',
    'number.base': 'O campo categoria_id deve ser um número inteiro.',
    'number.integer': 'O campo categoria_id deve ser um número inteiro.'
  }).options({ convert: false })
});

module.exports = produtoSchema;
