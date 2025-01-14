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
const ureqRoute = require('../../controller/ureq')
const riskRoute = require('../../controller/risk')
const planRoute = require('../../controller/plan')
const kegiatanRoute = require('../../controller/kegiatan')
const rescRoute = require('../../controller/resource')
const realRoute = require('../../controller/real')
const uatRoute = require('../../controller/uat')
const baRoute = require('../../controller/ba')
const roboRoute = require('../../controller/robo')
const dashRoute = require('../../controller/dashboard')
const swaggerRoute = require('../../controller/swagger')
const otoritasRoute = require('../../controller/otoritas')
const mptiRoute = require('../../controller/mpti')
const portoRoute = require('../../controller/porto')
const prokerRoute = require('../../controller/proker')
const cataRoute = require('../../controller/catalog')
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
         
          app.use(morgan('combined'));  
          app.use(express.json());
          app.use(cookieparsers())
          app.use('/api/dev/v1',dashRoute)
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null,options));
        app.use('/',swaggerRoute)
        //test helmet
        // const cspDefaults = helmet.contentSecurityPolicy.getDefaultDirectives();
        // delete cspDefaults['upgrade-insecure-requests'];
        
        // app.use(helmet({
        //     contentSecurityPolicy: { directives: cspDefaults }
        // }));
//===========================================================================//
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
        app.use('/api/profil',otoritasRoute)
        app.use('/api/profil', menuRoute)
        app.use('/api/profil', penggunaRoute)
        app.use('/api/proyek',kegiatanRoute);
        app.use('/api/proyek', layananRoute)
        app.use('/api/proyek', aplikasiRoute)
        app.use('/api/proyek',modulRoute)
        app.use('/api/proyek',proyekRoute)
        app.use('/api/proyek',charterRoute)
        app.use('/api/proyek',ureqRoute)
        app.use('/api/proyek', riskRoute)
        app.use('/api/proyek',planRoute)
        app.use('/api/proyek',rescRoute)
        app.use('/api/proyek',realRoute)
        app.use('/api/proyek',uatRoute)
        app.use('/api/proyek',baRoute)
        app.use('/api/proyek',roboRoute)
        app.use('/api/ref',mptiRoute)
        app.use('/api/ref',portoRoute)
        app.use('/api/ref',cataRoute)
        app.use('/api/ref',prokerRoute)

        app.use(function(req,res){
          res.status(404).send('Not Found');
      });
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