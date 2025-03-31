import "dotenv/config";
// import "./config/dbConn.js"; // review docs for mysql2 to better understand how to use connection pools
// express import and sets app
import express from "express";
const app = express();

// imports and usage of CORS headers, config, and whitelist
import credentials from "./middleware/credentials.js";
app.use(credentials); // Set header for cors to allow credentials from accepted sources
import cors from "cors"; //important for cors middleware
import corsOptions from "./config/corsConn.js";
app.use(cors(corsOptions));

// dumb path import to make __filename and __dirname work with es6
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// defines PORT variable with the port to listen on
const PORT = process.env.PORT || 8805;

// custom middleware imports
import { logger } from "./middleware/logEvents.js";
import errorHandler from "./middleware/errorHandler.js"; // Custom error handler import
import cookieParser from "cookie-parser"; // import of cookie-parser package to parse cookies
// controller imports
import { catchAll } from "./controllers/appController.js"; // catchAll controller to correctly serve a 404 if invalid api route is accessed
// route imports
import { rootRouter } from "./routes/root.js";

// custom middleware logger 
app.use(logger);

// built-in middleware to handle urlencoded data like form data
// ie. form data: `content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));

// built-in middleware for handling json (applied to all routes)
app.use(express.json());
// imported middleware for handling parsing of cookies (mmm... tasty :P)
app.use(cookieParser());

// built-in middleware to serve static files like css (basically anything in /public) to a request
app.use("/", express.static(path.join(__dirname, "/public"))); // each file or folder in /public can be referenced directly after the / in html views

// routes themselves
// routes with no JWT verification required
app.use('^/$|/index(.html)?', rootRouter); // index or just '/' route
app

// routes that require JWT verification



// app.all is also more standardly to be used for catching multiple routes in an umbrella (like if you want all accessing a /account/id route to require auth first, then you have an app.use(/account/*,auth) above it to catch all and run the auth middleware)
app.all("*", catchAll);
// this app.use allows us to use our custom errorHandler that logs errors as well as catching them
app.use(errorHandler);

// this bad boi just keeps our api listening, always ready for any request that may come its way
app.listen(PORT, () => {
    console.log(`You're Connected to the backend on port ${PORT}`);
  });