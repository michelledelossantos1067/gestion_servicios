const express = require('express');
const app = express();
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'store',
    password: 'qawsed',
    port: 5432,
  });
client.connect();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/verDeudas', async (req, res) => {
  try {
    const deudaQuery = `
      SELECT r.id_deuda, r.nombre, r.nombreEmpresa, r.deuda, r.restante, r.fecha_registro
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

app.post('/pagarDeuda', async (req, res) => {
  const { id_deuda, montoPago } = req.body;
  try {
    await client.query('BEGIN');
    const insertQuery = `
      INSERT INTO pagoDeuda (id_deuda, monto_pago)
      VALUES ($1, $2)
    `;
    await client.query(insertQuery, [id_deuda, montoPago]);

    const updateQuery = `
      UPDATE registrarDeuda
      SET restante = restante - $1
      WHERE id_deuda = $2 AND restante >= $1
    `;
    await client.query(updateQuery, [montoPago, id_deuda]);

    await client.query('COMMIT');
    res.redirect('/verDeudas');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al pagar la deuda' });
  }
});

app.delete('/eliminarDeuda/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = 'DELETE FROM registrarDeuda WHERE id_deuda = $1';
    await client.query(deleteQuery, [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la deuda' });
  }
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
