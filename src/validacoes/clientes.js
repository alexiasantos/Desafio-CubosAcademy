

const joi = require('joi')

const clienteSchema = joi.object({

    nome: joi.string()
        .required().trim().messages({
            'any.required': 'O campo nome é obrigatório.',
            'string.empty': 'O campo nome é obrigatório.',
            'string.base': 'O campo nome deve ser um string'
        }),

    email: joi.string().email().required().trim().messages({
        'any.required': 'O campo email é obrigatório.',
        'string.empty': 'O campo email é obrigatório.',
        'string.email': 'O campo email precisa ter um formato válido.'
    }),

    cpf: joi.string().required().trim().pattern(/^\d+$/).rule({ message: 'O campo cpf deve conter apenas dígitos numéricos' }).messages({
        'any.required': 'O campo cpf é obrigatório.',
        'string.empty': 'O campo cpf é obrigatório.',
        'string.base': 'O campo cpf deve ser uma string.',
    }).length(11).rule({ message: 'cpf deve ter 11 dígitos' }),

    cep: joi.string().trim()
    .pattern(/^\d+$/).rule({ message: 'O campo cep deve conter apenas dígitos numéricos.' })
    .length(8).rule({ message: 'cep deve ter 8 dígitos' })
    .empty('').default(null)
    .messages({
        'string.base': 'O campo cep deve ser uma string.',
    }),

    rua: joi.string().trim().empty('').default(null).messages({
        'string.base': 'O campo rua deve ser uma string.',
    }),
    numero: joi.string().trim().empty('').default(null).messages({
        'string.base': 'O campo numero deve ser uma string.',
    }),
    bairro: joi.string().trim().empty('').default(null).messages({
        'string.base': 'O campo bairro deve ser uma string.',
    }),
    cidade: joi.string().trim().empty('').default(null).messages({
        'string.base': 'O campo cidade deve ser uma string.',
    }),
    estado: joi.string().trim().empty('').default(null).messages({
        'string.base': 'O campo estado deve ser uma string.',
    }),
})

module.exports = clienteSchema
