import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import merchantRoutes from './routes/merchants.routes.js';
import productRoutes from './routes/products.routes.js';
import merchantSuggestionRoutes from './routes/merchantsuggestions.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import nearbyRoutes from './routes/nearby.routes.js';
import addressRoutes from './routes/addresses.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import imageRoutes from './routes/images.routes.js';
import staticRoutes from './routes/static.routes.js';
import checkJwt from './middleware/authentication.js';
import jwtAuthz from 'express-jwt-authz';
import adminRole from './middleware/admin.auth.js';
import { traceDeprecation } from 'process';
import logger from "./service/logger.service";

import morgan from "morgan";

const morganMiddleware = morgan("combined", {
   skip: (req, res) => res.statusCode < 400,
   stream: {
      write: msg => logger.http(msg)
   }
});

logger.info('Localog API Starting.');

const env = process.env.NODE_ENV || 'development';
console.log('environment: ' + env);
const baseURL = env === 'development' ? '../../' : '../';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
   cors: {
      origin: env === 'development' ? ['http://localhost:8080', 'http://192.168.0.17:8080', 'https://192.168.0.17:8080'] : ['https://localog.ca', 'http://localog.ca', 'https://www.localog.ca', 'http://www.localog.ca'],
      methods: ["GET", "POST"]
   }
});

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, `${baseURL}merchantapp/dist`)));

app.use(morganMiddleware);

app.use('/api/merchants',merchantRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/nearby',nearbyRoutes);
app.use('/api/addresses',addressRoutes);
app.use('/api/merchantsuggestions',merchantSuggestionRoutes);
app.use('/api/products',productRoutes);
app.use('/api/images',imageRoutes);
app.use('/api/static',staticRoutes);

app.use('/api/users', checkJwt, userRoutes);

const checkScopes = jwtAuthz([ 'view:my-merchants' ]);
app.get('/api/users/testscopes', checkJwt, checkScopes, function(req, res) {
   res.json({
      message: 'This is a private scoped endpoint!'
   });
});

app.use('/api/admin', checkJwt, adminRole, adminRoutes);

app.use(function (err, req, res, next) {
   if (err.name === 'UnauthorizedError') {
      res.status(401).json({message: 'Invalid Token.'});
   }
})

app.get('/', (req,res) => {
   res.sendFile(path.join(__dirname, `${baseURL}merchantapp/dist/index.html`));
})

const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.status(200).send({
   message: 'welcome to the API'
}));

io.on('connection', function(socket) {
   logger.debug('<><><><>Connected successfully to socket ...<><><><>');
   socket.on('view-merchant', (data) => {
      logger.debug('<<< view-merchant event >>>');
      logger.debug('Data: ');
      logger.debug(data);
      if ('merchantId' in data && data.merchantId !== null && typeof data.merchantId === 'string') {
         const roomId = 'MERCHANT_'+data.merchantId;
         if (socket.rooms.size > 1) {
            for (let r of socket.rooms) {
               if (r !== socket.id) {
                  socket.leave(r);
               }
            }
         }
         socket.join(roomId);
         const viewers = io.sockets.adapter.rooms.get(roomId).size;
         io.to(roomId).emit('currentViewers',{ viewers });
         logger.debug('Viewers: ' + viewers);
      }
   });
});

io.of("/").adapter.on("leave-room", (room, id) => {
   logger.debug(`socket ${id} has left room ${room}`);
   if (id !== room) {
      const viewers = io.sockets.adapter.rooms.get(room).size;
      io.to(room).emit('currentViewers',{ viewers });
   }
});

app.set('io',io);

server.listen(port, () => logger.info(`Server is running on PORT ${port}`));
