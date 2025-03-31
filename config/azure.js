import mysql2 from "mysql2/promise";
//import fs from 'node:fs';

const connectDB = mysql2.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: {
        ca: process.env.DB_SSL?.replace(/\\n/gm, '\n')//fs.readFileSync(process.env.DB_SSL)
    },
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

export default connectDB;