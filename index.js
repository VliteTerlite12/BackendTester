const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Backend is online!'); // Teks yang dikirim oleh backend
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})
