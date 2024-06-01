import express from 'express';
import routes from './routes';
import prisma from './database';
import errorHandler from './controllers/errorHandler';
import notFoundHandler from './controllers/notFoundHandler';

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;


app.use('/identify', routes);
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected');

        app.listen(port, () => {
            console.log('Server running on port 3000');
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();
