const oracle = require("oracledb");

const conf = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectString: process.env.CONNECTIONSTRING,
    poolMin: parseInt(process.env.POOLMIN),
    poolMax: parseInt(process.env.POOLMAX),
    poolIncrement: parseInt(process.env.POOLINCREMENT),
    poolPingInterval: 60,
    poolTimeout: 60,
    maxRows: 1000,
    enableStatistics: true
    
};

async function init() {
    await oracle.createPool(conf);
}

async function closePool() {
    await oracle.getPool().close(5);
}


let seqconn =null

function exec(statement, bind = [], opt = []) {
    return new Promise(async (resolve, reject) => {
        let conn = "";
        let result;
        opt.outFormat = oracle.OBJECT;
        opt.autoCommit = true;

        try {
            conn = await oracle.getConnection();
            //console.dir(bind)
            result = await conn.execute(statement, bind, opt);
            //console.dir(result)
            resolve(result);
        } catch (err) {
            console.log(err);
            reject(err);
        } finally {
            if (conn) {
                try {
                    await conn.close();
                    console.dir("close");
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }).catch((e) => {
        console.dir(e);
        return Promise.reject(e);
    });
}

 function seqexec(statement, bind = [], opt = [],conn) {
    return  new Promise(async (resolve, reject) => {
      // let seqconn=""
        try {
               
                // if(!seqconn){
                  
                //         seqconn = await oracle.getConnection()
                    
                   
                // }
                //console.dir(oracle.getPool().connectionsInUse)
                //console.dir(seqconn)
            const result = await conn.execute(statement, bind, opt);
            console.dir(result);
            resolve(result);
        } catch (err) {
            console.dir(err);
            console.dir("tryyyyy")
            reject(err);
        } 
        // finally {
        //     //console.dir(oracle.getPool().connectionsInUse)
        //     //console.dir(oracle.getPool().connectionsOpen)
        //     if (seqconn && last) {
        //         try {
        //           await seqconn.close()
        //           //closePool()
        //          // cek=true
        //             console.dir("close");
        //            // console.dir(oracle.getPool().connectionsInUse)
                    
                    
        //         } catch (err) {
        //           console.dir("finaly")
        //             console.log(err);
        //         }
        //     }
        // }
    }).catch((e) => {
        console.dir(e);
        console.dir("promiseee")
        return Promise.reject(e);
    });
}

// function seqexec2(statement, bind = [], opt = [], last) {
//     return  new Promise(async (resolve, reject) => {
//        let sn=""
//         try {
//             console.dir(bind)
//             sn = await oracle.getConnection()
//                const result = []
//               const batch =   bind.map(async (el, i, array) => {
//                     if (i == array.length-1) {
//                     const res = await sn.execute(statement, el, {autoCommit:true});
//                     result.push(res)
//                     }else{
//                         //console.log(statement)
//                     const res = await sn.execute(statement, el, opt);
//                     result.push(res)
//                     }
//                 });
//                 Promise.all(batch).then(()=>{
//                     console.dir(result);
//                     resolve(result);
//                     sn.close()
//                     console.dir(oracle.getPool().connectionsInUse)
//                 })
           
            
//         } catch (err) {
//             console.dir(err);
//             console.dir("tryyyyy")
//             reject(err);
//         } 
//          finally {
//             console.dir(oracle.getPool().connectionsInUse)
//         //     //console.dir(oracle.getPool().connectionsOpen)
//         //     if (sn) {
//         //         try {
//         //           await sn.close()
//         //           //closePool()
//         //          // cek=true
//         //             console.dir("close");
//         //            // console.dir(oracle.getPool().connectionsInUse)
                    
                    
//         //         } catch (err) {
//         //           console.dir("finaly")
//         //             console.log(err);
//         //         }
//         //     }
//         }
//     }).catch((e) => {
//         console.dir(e);
//         console.dir("promiseee")
//         return Promise.reject(e);
//     });
// }



//module.exports.seqexec2 = seqexec2;
module.exports.exec = exec;
module.exports.seqexec = seqexec;
module.exports.init = init;
module.exports.closePool = closePool;
