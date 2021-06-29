const oracle = require('oracledb');

const conf = {
    user:process.env.USER,
    password:process.env.PASSWORD,
    connectString:process.env.CONNECTIONSTRING,
    poolMin:4,
    poolMax:4,
    poolIncrement:0,
    poolPingInterval:60,
    poolTimeout: 60,
    maxRows:1000
} 

async function init(){
   
   await oracle.createPool(conf);
  
}

async function closePool(){
   
    await oracle.getPool().close(5);
   
}
let seqconn
function exec(statement,bind=[],opt=[]){
    return new Promise(async(resolve,reject)=>{
        
        opt.outFormat = oracle.OBJECT;
        opt.autoCommit = true;

        try{
          
          let conn =''
        let result
           console.dir(conn)
           console.dir(statement)
           
                conn = await oracle.getConnection();
            result = await conn.execute(statement,bind,opt);
           
            //console.dir(result);
            resolve(result);
        }catch(err){
            
            console.log(err)
            reject(err);
        }finally{
            
                try{
                    if(conn ){
                    await conn.close()
                    
                    console.dir('close')
                    }
                }catch(err){
                    console.log(err);
                }
            
        }
    });
}

function seqexec(statement,bind=[],opt=[],last){
    return new Promise(async(resolve,reject)=>{
       try{
        if(!seqconn){
        seqconn = await oracle.getConnection();
        }
        
             const result =  await seqconn.execute(statement,bind,opt);
             console.dir(result);
             resolve(result);
         }catch(err){
             
             console.log(err)
             reject(err);
         }finally{

            if(seqconn && last ){
                 try{
                     
                     await seqconn.close()
                     
                     console.dir('close')
                     seqconn = ''
                 }catch(err){
                    seqconn = ''
                     console.log(err);
                 }
                }
             
         }
          

    })

}

module.exports.exec = exec
module.exports.seqexec = seqexec
module.exports.init = init
module.exports.closePool = closePool