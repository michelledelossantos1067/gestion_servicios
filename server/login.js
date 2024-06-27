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
    res.sendFile(path.join(__dirname, '../pages/login.html'))
})
router.post('/', async (req, res) => {
    const { correo, contraseña } = req.body

    const query = {
        text: 'SELECT * FROM acceso WHERE correo = $1 AND contraseña = $2',
        values: [correo, contraseña]
    }
   

    client.query(query)
        .then((result) => {
            if (result.rows.length > 0) {
                console.log(`Inicio de sesión exitoso: ${correo}`);
            } else {
                console.log('Correo o contraseña incorrectos');
            }
        })
        .catch((err) => {
            console.log('Error interno del servidor', err);

        })
})



module.exports = router;
