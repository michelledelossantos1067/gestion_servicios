const {Client} = require('pg')
const { Router } = require('express');
const path = require('path')
const router = Router();

const client = new Client({
    user:'postgres',
    port:5432,
    host:'localhost',
    password:'qawsed',
    database:'store'
})

client.connect()
.then(()=> console.log('Conectados'))
.catch((err)=> console.error('Error al conectar',err))


router.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../pages/registration.html'))
})
router.post('/',async (req,res)=>{
    const {nombre,apellido,correo,contraseña} = req.body

    const query={
        text: 'INSERT INTO registro(nombre,apellido,correo,contraseña) VALUES ($1,$2,$3,$4) RETURNING *',
        values:[nombre,apellido,correo,contraseña]
    }

    client.query(query)
    .then(() => console.log(`Registrado corretamente: ${correo}`))
    .catch((err)=>{
        console.log('Error interno del servidor',err);
    })
})

module.exports = router;
