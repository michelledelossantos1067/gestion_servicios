const express = require('express');
const { Client } = require('pg');
const app = express();
const port = 1000;

// Configura la conexión a la base de datos
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

// Ruta para mostrar formulario de cliente
app.get('/nuevoCliente', (req, res) => {
  res.render('nuevoCliente');
});

app.post('/nuevoCliente', async (req, res) => {
  const { nombre, apellido, email, pais, dirección, telefono, estado, ocupación } = req.body;

  // Validar que dirección no sea null
  // if (!nombre || !apellido || !email || !pais || !dirección || !telefono || !estado || !ocupación) {
  //   return res.status(400).json({ error: 'Todos los campos son obligatorios, incluyendo dirección.' });
  // }

  try {
    const insertQuery = `
      INSERT INTO client (nombre, apellido, email, pais, dirección, telefono, estado, ocupación, fecha_registro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
      RETURNING id_cliente
    `;
    const result = await client.query(insertQuery, [nombre, apellido, email, pais, dirección, telefono, estado, ocupación]);
    const id_cliente = result.rows[0].id_cliente;

    console.log('Nuevo cliente ID:', id_cliente); // Añadido para depuración
    res.redirect('/nuevaEmpresa/' + id_cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar cliente' });
  }
});


// Ruta para mostrar formulario de empresa
app.get('/nuevaEmpresa/:id_cliente', (req, res) => {
  const { id_cliente } = req.params;
  res.render('nuevaEmpresa', { id_cliente });
});

// Ruta para procesar formulario de nueva empresa
app.post('/nuevaEmpresa', async (req, res) => {
  const { nombreEmpresa, email, pais, dirección, telefono, estado, codigo_postal, id_cliente } = req.body;

  // if (!nombreEmpresa || !email || !pais || !direccion || !telefono || !estado || !codigo_postal || !id_cliente) {
  //   return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  // }

  try {
    const insertQuery = `
      INSERT INTO empresa (nombreEmpresa, email, pais, dirección, telefono, estado, codigo_postal, fecha_registro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
      RETURNING id_empresa
    `;
    const result = await client.query(insertQuery, [nombreEmpresa, email, pais, dirección, telefono, estado, codigo_postal]);
    const id_empresa = result.rows[0].id_empresa;

    res.redirect('/nuevaDeuda/' + id_cliente + '/' + id_empresa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar empresa' });
  }
});

app.get('/nuevaDeuda/:id_cliente/:id_empresa', async (req, res) => {
  let { id_cliente, id_empresa } = req.params;
  
 
  console.log('ID Cliente en /nuevaDeuda:', id_cliente);
  console.log('ID Empresa en /nuevaDeuda:', id_empresa);

  try {
    const clienteQuery = 'SELECT nombre FROM client WHERE id_cliente = $1';
    const empresaQuery = 'SELECT nombreEmpresa FROM empresa WHERE id_empresa = $1';

    const clienteResult = await client.query(clienteQuery, [id_cliente]);
    const empresaResult = await client.query(empresaQuery, [id_empresa]);

    if (clienteResult.rows.length === 0 || empresaResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cliente o Empresa no encontrado' });
    }

    const nombre = clienteResult.rows[0].nombre;
    const nombreEmpresa = empresaResult.rows[0].nombreempresa; // Asegúrate que el nombre de la columna sea correcto

    res.render('nuevaDeuda', { id_cliente, id_empresa, nombre, nombreEmpresa });
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

// Conexión a la base de datos y arranque del servidor
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
