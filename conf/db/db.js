const oracle = require("oracledb");

const conf = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectString: process.env.CONNECTIONSTRING,
    poolMin: 32,
    poolMax: 32,
    poolIncrement: 0,
    poolPingInterval: 60,
    poolTimeout: 60,
    maxRows: 1000,
};

async function init() {
    await oracle.createPool(conf);
}

async function closePool() {
    await oracle.getPool().close(5);
}
let seqconn;

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

function seqexec(statement, bind = [], opt = [], last) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!seqconn) {
                seqconn = await oracle.getConnection();
            }
            console.dir(bind)
            const result = await seqconn.execute(statement, bind, opt);
            console.dir(result);
            resolve(result);
        } catch (err) {
            console.log(err);
            reject(err);
        } finally {
            if (seqconn && last) {
                try {
                    await seqconn.close();

                    console.dir("close");
                    seqconn = "";
                } catch (err) {
                    seqconn = "";
                    console.log(err);
                }
            }
        }
    }).catch((e) => {
        console.dir(e);
        return Promise.reject(e);
    });
}

module.exports.exec = exec;
module.exports.seqexec = seqexec;
module.exports.init = init;
module.exports.closePool = closePool;
