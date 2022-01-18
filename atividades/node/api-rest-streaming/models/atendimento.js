const conexao = require('../infraestrutura/database/conexao')
const moment = require('moment')
const axios = require('axios')
const repositorio = require('../repositorios/atendimento')

class Atendimento {

    constructor() {

        this.dataEhValida = (data, dataCriacao) => { moment(data).isSameOrAfter(dataCriacao) }
        this.clienteEhValido = (tamanho) => { tamanho > 4 }
        this.valida = parametros => {
            this.validacoes.filter(campo => {
                const { nome } = campo
                const parametro = parametros[nome]
            })
        }

        this.validacoes = [
            {
                nome: 'date',
                valido: this.dataEhValida,
                mensagem: 'A data deve ser maior ou igual a data atual'

            },
            {
                nome: 'cliente',
                valido: this.clienteEhValido,
                mensagem: 'O nome do cliente deve conter mais do que cinco letras'
            }
        ]
    }


    adicona(atendimento) {

        const dataCriacao = moment().format('YYYY-MM-DD HH:mm:ss')
        const data = moment(atendimento.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss')

        const parametros = {
            data: { data, dataCriacao },
            cliente: { tamanho: atendimento.cliente.length }
        }

        const erros = this.valida(parametros)
        const existemErros = erros.length

        if (existemErros) {
            return new Promise((resolve, reject) => reject(erros))
        } else {
            const atendimentoDatado = { ...atendimento, dataCriacao, data }

            return repositorio.adiciona(atendimentoDatado).then(resultado => {
                const id = resultado.insertId

                return { ...atendimento, id }
            })
        }
    }

    lista() {
        return repositorio.lista()
    }

    listaPorId(id, res) {

        const sql = `SELECT * FROM Atendimentos WHERE id=${id}`

        conexao.query(sql, async (erro, resultados) => {

            const atendimento = resultados[0]
            const cpf = atendimento.cliente

            if (erro) {
                res.status(400).json(erro)
            } else {
                const { data } = await axios.get(`http://localhost:8082/${cpf}`)

                atendimento.cliente = data

                res.status(200).json(atendimento)
            }
        })
    }

    atualizar(id, valores, res) {

        if (valores.data) {
            valores.data = moment(valores.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:MM:SS')
        }

        const sql = 'UPDATE Atendimentos SET ? WHERE id=?'

        conexao.query(sql, [valores, id], (erro, resultados) => {
            if (erro) {
                res.status(400).json(erro)
            } else {
                res.status(200).json({ ...valores, id })
            }
        })
    }

    deleta(id, res) {
        const sql = 'DELETE FROM Atendimentos WHERE id=?'

        conexao.query(sql, id, (erro, resultados) => {
            if (erro) {
                res.status(400).json(erro)
            } else {
                res.status(200).json({ id })
            }
        })
    }
}

module.exports = new Atendimento