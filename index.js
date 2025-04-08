const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRouter = require('./routers/authRouter')
const postsRouter = require('./routers/postsRouter')
const usersRouter = require('./routers/usersRouter') // Importando o usersRouter

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// URL de conexão para MongoDB em Docker
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use ('/api/users', usersRouter); // Adicione esta linha para usar o usersRouter

app.get('/', (req, res) => {
    res.json({ message: 'Hello from the server' })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});