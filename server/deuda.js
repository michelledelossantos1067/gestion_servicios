const {Client} = require('pg')
const { Router } = require('express');
const path = require('path')
const router = Router();


const client = new Client({
    user:'postgres',
    password:'qawsed',
    database:'store',
    host:'localhost',
    port:5432
})

client.connect()
.then(()=>console.log('Conection'))
.catch((err)=>console.log('Error al conectar la base de datos',err))

router.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../pages/deuda.html'))
})

router.post('/',(req,res)=>{
    const {cliente,empresa,deuda,pago,total} = req.body

    const query ={
        text:'INSERT INTO Tienda(cliente,empresa,deuda,pago,total) VALUES ($1,$2,$3,$4,$5)',
        values:[cliente,empresa,deuda,pago,total]
    }

    client.query(query)
    .then(()=> console.log('Datos insertados correctamente'))
    .catch((err)=>{
        console.log('Error interno del servidor',err);
        
    })
})

// app.use(express.static(path.join(__dirname,'public')))
// app.listen(port,()=>{
//     console.log(`Servidor corriendo en el puerto: http://localhost:${port}`);
// })

module.exports = router;
