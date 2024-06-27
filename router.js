const express = require('express');
const path = require('path');
const loginRoutes = require('./server/login');
const registroRoutes = require('./server/registration');
const deudaRoutes = require('./server/deuda');
const clientRoutes = require('./server/client');
const empresaRoutes = require('./server/empresa');

const port = 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/login', loginRoutes);
app.use('/registro', registroRoutes);
app.use('/deuda', deudaRoutes);
app.use('/client', clientRoutes);
app.use('/empresa', empresaRoutes);


app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto: http://localhost:${port}`);
});
