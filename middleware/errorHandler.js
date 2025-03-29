import { logEvents } from "./logEvents.js"; //logEvents comes in handy again to create a separate errLog.txt file to save error messages in separate from requests

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
    console.error(err.stack);
    res.status(500).send(err.message);
};

export default errorHandler;