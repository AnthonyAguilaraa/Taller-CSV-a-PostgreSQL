const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
  
//routes


app.use(require('./routes/csvpostgreRoutes'));

app.listen(5000);
console.log('Servicio corriendo en puerto: 5000');
