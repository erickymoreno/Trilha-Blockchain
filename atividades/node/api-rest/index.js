const express = require('express')

const app = express()

const port = 3000
app.listen(port, () => {console.log('Helo World!') })

app.get('/', (req, res) => res.send(`Servidor rodando na porta ${port}`))