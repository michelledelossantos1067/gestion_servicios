const express = require('express');
const { Client } = require('pg');
const app = express();
const port = 1000;

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'store',
  password: 'qawsed',
  port: 5432,
});


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/nuevoCliente', (req, res) => {
  res.render('nuevoCliente');
});

app.post('/nuevoCliente', async (req, res) => {
  const { nombre, apellido, email, pais, dirección, telefono, estado, ocupación } = req.body;

  try {
    const insertQuery = `
      INSERT INTO client (nombre, apellido, email, pais, dirección, telefono, estado, ocupación, fecha_registro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
      RETURNING id_cliente
    `;
    const result = await client.query(insertQuery, [nombre, apellido, email, pais, dirección, telefono, estado, ocupación]);
    const id_cliente = result.rows[0].id_cliente;

    console.log('Nuevo cliente ID:', id_cliente); 
    res.redirect('/nuevaEmpresa/' + id_cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar cliente' });
  }
});

app.get('/nuevaEmpresa/:id_cliente', (req, res) => {
  const { id_cliente } = req.params;
  console.log('ID Cliente en /nuevaEmpresa:', id_cliente); 
  res.render('nuevaEmpresa', { id_cliente });
});

app.post('/nuevaEmpresa', async (req, res) => {
  const { nombreEmpresa, email, pais, dirección, telefono, estado, codigo_postal, id_cliente } = req.body;

  try {
    const insertQuery = `
      INSERT INTO empresa (nombreEmpresa, email, pais, dirección, telefono, estado, codigo_postal, fecha_registro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
      RETURNING id_empresa
    `;
    const result = await client.query(insertQuery, [nombreEmpresa, email, pais, dirección, telefono, estado, codigo_postal]);
    const id_empresa = result.rows[0].id_empresa;

    console.log('Nueva empresa ID:', id_empresa); 
    res.redirect('/nuevaDeuda/' + id_cliente + '/' + id_empresa);
  } catch (err) {
    if (err.code === '23505') {
      console.error('Error: clave duplicada.');
      res.status(400).json({ error: 'Error: clave duplicada.' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Error al agregar empresa' });
    }
  }
});

app.get('/nuevaDeuda/:id_cliente/:id_empresa', async (req, res) => {
  let { id_cliente, id_empresa } = req.params;

  id_cliente = parseInt(id_cliente, 10);
  id_empresa = parseInt(id_empresa, 10);

  console.log('ID Cliente en /nuevaDeuda:', id_cliente);
  console.log('ID Empresa en /nuevaDeuda:', id_empresa);

  try {
    const clienteQuery = 'SELECT id_cliente, nombre FROM client';
    const empresaQuery = 'SELECT id_empresa, nombreEmpresa FROM empresa';

    const clienteResult = await client.query(clienteQuery);
    const empresaResult = await client.query(empresaQuery);

    const clients = clienteResult.rows;
    const companies = empresaResult.rows;

    res.render('nuevaDeuda', { id_cliente, id_empresa, clients, companies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos para nueva deuda' });
  }
});

app.post('/nuevaDeuda', async (req, res) => {
  const { id_cliente, id_empresa, nombre, nombreEmpresa, deuda } = req.body;

  try {
    const insertQuery = `
      INSERT INTO registrarDeuda (id_cliente, id_empresa, nombre, nombreEmpresa, deuda)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(insertQuery, [id_cliente, id_empresa, nombre, nombreEmpresa, deuda]);

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar nueva deuda' });
  }
});

// Ruta para mostrar los registros de deuda
app.get('/verDeudas', async (req, res) => {
  try {
    const deudaQuery = `
      SELECT r.nombre, r.nombreEmpresa, r.deuda
      FROM registrarDeuda r
      JOIN client c ON r.id_cliente = c.id_cliente
      JOIN empresa e ON r.id_empresa = e.id_empresa
    `;
    const deudaResult = await client.query(deudaQuery);
    const deudas = deudaResult.rows;

    res.render('verDeudas', { deudas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los registros de deuda' });
  }
});

client.connect()
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar la base de datos', err);
  });


