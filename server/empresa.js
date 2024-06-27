const { Client } = require('pg')
const {Router} = require('express')
const path = require('path')

const router = Router();

const client = new Client({
    user: 'postgres',
    port: 5432,
    host: 'localhost',
    password: 'qawsed',
    database: 'store'
})

client.connect()
    .then(() => console.log('Conectados'))
    .catch((err) => console.error('Error al conectar', err))

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/empresa.html'))
})
router.post('/', (req, res) => {
    const { nombreEmpresa,email,telefono,dirección,estado,pais,codigo_postal } = req.body

    const query = {
        text: 'INSERT INTO empresa(nombreEmpresa,email,telefono,dirección,estado,pais,codigo_postal) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        values: [ nombreEmpresa,email,telefono,dirección,estado,pais,codigo_postal]
    }
   

    client.query(query)
        .then(() => console.log(`Empresa registrada`))
        .catch((err) => {
            console.log('Error interno del servidor', err);

        })
})

  
module.exports = router;
