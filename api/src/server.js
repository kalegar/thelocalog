import express from 'express';
import path from 'path';
import cors from 'cors';
import merchantRoutes from './routes/merchants.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import nearbyRoutes from './routes/nearby.routes.js';
import addressRoutes from './routes/addresses.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import checkJwt from './middleware/authentication.js';
import jwtAuthz from 'express-jwt-authz';
import adminRole from './middleware/admin.auth.js';

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const env = process.env.NODE_ENV || 'development';
console.log('environment: ' + env);
const baseURL = env === 'development' ? '../../' : '../';

app.use(express.static(path.join(__dirname, `${baseURL}merchantapp/dist`)));

app.use('/api/merchants',merchantRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/nearby',nearbyRoutes);
app.use('/api/addresses',addressRoutes)

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

app.listen(port, () => console.log(`Server is running on PORT ${port}`));
