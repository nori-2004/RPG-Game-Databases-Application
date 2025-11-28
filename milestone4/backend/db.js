const oracledb = require('oracledb');
const path = require('path');
const loadEnvFile = require('./utils/envUtil');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool;

function sanitizeEnv(rawEnv = {}) {
    return Object.entries(rawEnv).reduce((acc, [key, value]) => {
        if (!key) {
            return acc;
        }
        acc[key.trim()] = typeof value === 'string' ? value.trim() : value;
        return acc;
    }, {});
}

const envPath = path.join(__dirname, '.env');
const fileEnv = sanitizeEnv(loadEnvFile(envPath) || {});
const envVariables = {
    ...fileEnv,
    ...process.env
};

const connectString = envVariables.ORACLE_CONNECT_STRING
    || (envVariables.ORACLE_HOST && envVariables.ORACLE_PORT && envVariables.ORACLE_DBNAME
        ? `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
        : undefined);

const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString,
    poolMin: Number(envVariables.ORACLE_POOL_MIN) || 1,
    poolMax: Number(envVariables.ORACLE_POOL_MAX) || 4,
    poolIncrement: Number(envVariables.ORACLE_POOL_INCREMENT) || 1,
    poolTimeout: Number(envVariables.ORACLE_POOL_TIMEOUT) || 60
};

async function initPool() {
    if (pool) {
        return pool;
    }
    try {
        pool = await oracledb.createPool(dbConfig);
        console.log('Oracle connection pool started');
        return pool;
    } catch (err) {
        console.error('Failed to start Oracle connection pool', err);
        throw err;
    }
}

async function closePool() {
    if (!pool) {
        return;
    }
    try {
        await pool.close(10);
        console.log('Oracle connection pool closed');
        pool = null;
    } catch (err) {
        console.error('Error closing Oracle pool', err);
    }
}

async function getConnection() {
    if (!pool) {
        await initPool();
    }
    return pool.getConnection();
}

async function query(sql, binds = {}, options = {}) {
    let connection;
    try {
        connection = await getConnection();
        return await connection.execute(sql, binds, options);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing Oracle connection', err);
            }
        }
    }
}

module.exports = {
    initPool,
    closePool,
    getConnection,
    query
};
