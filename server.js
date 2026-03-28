const express = require('express');
const cors = require('cors');
const decisionRoutes = require('./routes/decisionRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api', decisionRoutes);
app.use('/api', require('./routes/chatRoutes'));


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
