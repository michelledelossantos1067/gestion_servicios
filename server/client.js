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
    res.sendFile(path.join(__dirname, '../pages/client.html'))
})
router.post('/', async (req, res) => {
    const { nombre,apellido,email,pais,dirección,telefono,estado,ocupación } = req.body

    const query = {
        text: 'INSERT INTO client(nombre,apellido,email,pais,dirección,telefono,estado,ocupación) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        values: [nombre,apellido,email,pais,dirección,telefono,estado,ocupación]
    }
   

    client.query(query)
        .then(() => console.log(`Cliente registrado`))
        .catch((err) => {
            console.log('Error interno del servidor', err);

        })
})


module.exports = router;

// const express = require('express');
// const { Client } = require('pg');
// const  path  = require('path');
// const app = express();
// const port = 4000;

//  const client = new Client({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'store',
//   password: 'qawsed',
//   port: 5432,
// });
// client.connect()
// .then(()=> console.log())
// .catch((err)=> console.error('',err))

// app.use(express.static('public'));

// app.get('/client', (req, res) => {
//     res.sendFile(path.join(__dirname,'../pages/deuda.html'))
// })
// app.post('/client',(req,res)=>{
//     const {nombre,apellido} = req.body
//     const query ={
//         text: '',
//         values:[nombre,apellido]
//     }

//     client.query(query)
//     .then(()=> console.log())
//     .catch((err)=> console.error('',err))

// })
    
// app.use(express.static(path.join(__dirname,'public')))

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
