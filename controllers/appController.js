//the dumb__filename and __dirname import to make them functional :|
import { fileURLToPath } from "url";
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const catchAll = (req, res) => {
  // express can automatically send a 404 if a link isn't found, but here we specify a specific file for the 404
  // issue is, because we provide a file, then it'll just return a 200 code so we need to chain in a status of 404 manually
  res.status(404); 
  // following if else waterfall allows us to have more specific responses to various 404 requests
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname,"..", "views", "404.html")); // we send html file here if headers of request specify it accepts html
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" }); // original request headers say it accepts json so we send json response instead of html
  } else {
    res.type("txt").send("404 Not Found"); // original request headers say it accepts txt so we send txt response instead of json
  }
};

export { catchAll };