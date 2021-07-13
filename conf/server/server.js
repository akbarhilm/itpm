const express = require('express');

const http = require('http');
const port = process.env.HTTP_PORT || 3000
const helmet = require('helmet');
const morgan = require('morgan');
const cookieparsers = require('cookie-parser')
const penggunaRoute = require('../../controller/pengguna');
const menuRoute = require('../../controller/menu');
const layananRoute = require('../../controller/layanan');
const aplikasiRoute = require('../../controller/aplikasi');
const modulRoute = require('../../controller/modul')
const proyekRoute = require('../../controller/proyek')
const charterRoute = require('../../controller/charter')
const swaggerRoute = require('../../controller/swagger')
//const assignJwt = require('../../util/assign');
const os = require('os')
var jwt = require('express-jwt');
const fs = require('fs')

var key = fs.readFileSync(process.env.KEY)

const swaggerUi = require('swagger-ui-express');

console.dir(os.hostname())
var options = {
    explorer: true,
    swaggerOptions: {
      urls: [
        {
          url: `http://10.1.94.235:5000/v2/profil`,
          name: 'profil'
        },
        {
          url: `http://10.1.94.235:5000/v2/proyek`,
          name: 'proyek'
        }
      ]
    },
    validatorUrl: null
  }
const app = express();

let server;
//const nik = jwt({secret:key,algorithms: ['RS256']})
function init() {
    return new Promise((resolve, reject) => {
        app.use(function (req, res, next) {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');
            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // Request headers you wish to allow
            //res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type,set-cookie');
            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            //res.setHeader('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Headers', ['Content-Type','Authorization']);
         
            // Pass to next layer of middleware
            next();
          });
          app.use(helmet());
          app.use(morgan('combined'));  
          app.use(express.json());
          app.use(cookieparsers())
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null,options));
        app.use('/',swaggerRoute)
       // app.use('/api/jwt',assignJwt) //for assign to httpOnly
      
        app.use(jwt({secret:key,algorithms: ['RS256']}))

        // app.use(jwt({secret:key,algorithms: ['RS256'],
        //        getToken: (req)=> req.cookies.token}))//from httpOnly cookie

       app.use(function (err, req, res, next) {
        
        //console.dir(req.cookies.token)
        if (err.name === 'UnauthorizedError') {
          res.status(401).json(["UnAuthorize!"]);
        
      }
      });
        
        app.use('/api/profil', menuRoute)
        app.use('/api/profil', penggunaRoute)
        app.use('/api/proyek', layananRoute)
        app.use('/api/proyek', aplikasiRoute)
        app.use('/api/proyek',modulRoute)
        app.use('/api/proyek',proyekRoute)
        app.use('/api/proyek',charterRoute)
        
       server =  http.createServer(app).listen(port)
            .on('listening', () => {
                console.log('Starting on localhost:' + port)
                resolve();
            })
            .on('erro', (err) => {
                console.error(err)
                reject(err);
            })
    });
}

function close(){
    return new Promise((resolve,reject)=>{
       server.close((err)=>{
           if(err){
               console.log(err);
               reject(err)
           }
           resolve()
       }) 
    })
}

module.exports.init = init;
module.exports.close = close;