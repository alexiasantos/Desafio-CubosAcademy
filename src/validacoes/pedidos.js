const joi = require("joi");

const pedidoSchema = joi.object({
  observacao: joi.string().trim().empty('').default(null).messages({
    'string.base': 'O campo observacao deve ser uma string.',
  }),
    
  cliente_id: joi.number().min(1).integer().required().messages({
    'any.required': 'O campo cliente_id é obrigatório.',
    'number.empty': 'O campo cliente_id é obrigatório.',
    'number.base': 'O campo cliente_id deve ser um número inteiro.',
    'number.integer': 'O campo cliente_id deve ser um número inteiro.',
    'number.min': 'O campo cliente_id deve ser um número inteiro maior que zero.'
  }).options({ convert: false }),
 
  pedido_produtos:joi.array().required().messages({
    'any.required': 'O campo pedido_produtos é obrigatório.',
  }).items({
    produto_id: joi.number().min(1).integer().required().messages({
      'any.required': 'O campo produto_id é obrigatório.',
      'number.empty': 'O campo produto_id é obrigatório.',
      'number.base': 'O campo produto_id deve ser um número inteiro.',
      'number.integer': 'O campo produto_id deve ser um número inteiro.',
      'number.min': 'O campo produto_id deve ser um número inteiro maior que zero.'
    }).options({ convert: false }),
  
    quantidade_produto: joi.number().min(1).integer().required().messages({
      'any.required': 'O campo quantidade_produto é obrigatório.',
      'number.empty': 'O campo quantidade_produto é obrigatório.',
      'number.base': 'O campo quantidade_produto deve ser um número inteiro.',
      'number.integer': 'O campo quantidade_produto deve ser um número inteiro.',
      'number.min': 'O campo quantidade_produto deve ser um número inteiro maior que zero.'
    }).options({ convert: false })
  })
  
});

module.exports = pedidoSchema;