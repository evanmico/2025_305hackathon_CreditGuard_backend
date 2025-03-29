import whiteList from "./corsWhiteListConn.js"; //localhost (127 and localhost) are just there during dev, once publishing you only leave your front-end able to access

const corsOptions = {
  origin: (origin, callback) => {
    // !origin is only DURING dev since otherwise we can't access our ownbackend
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      //if domain accessing api is inside whiteList show null for error and permit it through
      callback(null, true);
    } else {
      callback(new Error("Not allowed by all mighty CORS"));
    }
  },
  optionsSuccessStatus: 200,
  //credentials: true,
};

export default corsOptions;