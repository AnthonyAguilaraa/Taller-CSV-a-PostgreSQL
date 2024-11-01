const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const pool = require('../conexion');



//  Endpoint para guardar desde un CSV a una tabla en PostgreSQL
const uploadCsv = (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      const client = await pool.connect();
      try {
        for (const row of results) {
          await client.query('INSERT INTO employees (first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [
              row.first_name,
              row.last_name,
              row.email,
              row.phone_number,
              row.hire_date,
              row.job_id,
              row.salary,
              row.commission_pct,
              row.manager_id,
              row.department_id]);
        }
        res.status(200).send('CSV guardado en la base de datos.');
      } catch (error) {
        console.error(error);
        res.status(500).send('Error al guardar en la base de datos.');
      } finally {
        client.release();
       // fs.unlinkSync(req.file.path); // Elimina el archivo CSV después de procesarlo
      }
    });
};

// Endpoint para guardar desde una tabla en PostgreSQL a un CSV
const downloadCsv = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM employees');

    const csvWriter = createObjectCsvWriter({
      path: 'output/data.csv',
      header: [
        { id: 'employee_id', title: 'Employee ID' },
        { id: 'first_name', title: 'First Name' },
        { id: 'last_name', title: 'Last Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone_number', title: 'Phone Number' },
        { id: 'hire_date', title: 'Hire Date' },
        { id: 'job_id', title: 'Job ID' },
        { id: 'salary', title: 'Salary' },
        { id: 'commission_pct', title: 'Commission Pct' },
        { id: 'manager_id', title: 'Manager ID' },
        { id: 'department_id', title: 'Department ID' },
      ],
    });

    await csvWriter.writeRecords(result.rows);
    res.download('output/data.csv', 'data.csv', (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al descargar el CSV.');
      }
      fs.unlinkSync('output/data.csv'); // Elimina el archivo CSV después de descargarlo
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al recuperar datos de la base de datos.');
  } finally {
    client.release();
  }
};

module.exports = { uploadCsv, downloadCsv };
