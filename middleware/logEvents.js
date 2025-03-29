import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';


const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    console.log(logItem);
    try {                                //the dots take us up one directory so that we can make logs dir in main dir
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem);
    } catch (err) {
        console.log(err);
    }
}

const logger = (req, res, next) => {
        logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
        console.log(`${req.method} ${req.path}`);
        next();
}

export { logger, logEvents };