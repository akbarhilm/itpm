require ('custom-env').env(true)
const server = require('./conf/server/server');
const database = require('./conf/db/db')
async function startup(){
    
 
    // QRCode.toString('270',{type:'terminal'}, function (err, url) {
    //   console.log(url)
    // })
    console.log('Starting...')
    try{
    await database.init();
    await server.init()
    }catch(err){
        console.error(err);
        process.exit(1);
    }
}

async function shutdown(e){
    let err = e
    console.dir('shutting down');
    try{
        await database.closePool();
        await server.close(e);
        
    }catch(e){
        console.error('error',e);
        err = err||e
    }

    if(err){
        process.exit(1);
    }else{
        process.exit(0);
    }
}

process.on('SIGTERM',()=>{
    console.log('Rec SIGTERM');
    shutdown();
});

process.on('SIGINT',()=>{
    console.log('Rec SIGINIT');
    shutdown();
});

process.on('uncaughtException',err=>{
    console.log('Uncaught Excp');
    console.error('err');
    shutdown(err);
})

startup();