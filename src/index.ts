import express from 'express';
import routes from './routes';
import prisma from './database';

const app = express();
app.use(express.json());

app.use('/identify', routes);

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected');

        app.listen(3000, () => {
            console.log('Server running on port 3000');
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();
