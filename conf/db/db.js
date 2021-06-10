const oracle = require('oracledb');

const conf = {
    user:process.env.USER,
    password:process.env.PASSWORD,
    connectString:process.env.CONNECTIONSTRING,
    poolMin:14,
    poolMax:14,
    poolIncrement:0,
    maxRows:1000
} 

async function init(){
    console.log(conf)
    const pool = await oracle.createPool(conf);
}

async function close(){
    await oracle.getPool.close();
}

function exec(statement,bind=[],opt=[]){
    return new Promise(async(resolve,reject)=>{
        let conn;
        opt.outFormat = oracle.OBJECT;
        opt.autoCommit = true;

        try{
            conn = await oracle.getConnection();

            const result = await conn.execute(statement,bind,opt);
            console.dir(result);
            resolve(result);
        }catch(err){
            reject(err);
        }finally{
            if(conn){
                try{
                    await conn.close();
                }catch(err){
                    console.log(err);
                }
            }
        }
    });
}

module.exports.exec = exec
module.exports.init = init
module.exports.close = close