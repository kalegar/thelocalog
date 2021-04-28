import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import merchantRoutes from './routes/merchants.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import nearbyRoutes from './routes/nearby.routes.js';
import userRoutes from './routes/user.routes';
import checkJwt from './middleware/authentication.js';
import jwtAuthz from 'express-jwt-authz';

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const env = process.env.NODE_ENV || 'development';
const baseURL = env === 'development' ? '../../' : '../';

app.use(express.static(path.join(__dirname, `${baseURL}merchantapp/dist`)));

app.use('/api/merchants',merchantRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/nearby',nearbyRoutes);

app.use('/api/user', checkJwt, userRoutes);

const checkScopes = jwtAuthz([ 'view:my-merchants' ]);
app.get('/api/user/testscopes', checkJwt, checkScopes, function(req, res) {
   res.json({
      message: 'This is a private scoped endpoint!'
   });
});

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

app.listen(port, () => console.log(`Server is running on PORT ${port}`));
