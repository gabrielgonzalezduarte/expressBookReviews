const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "ljbP1rDQuy67uh9cadWnxuqhq68ENAI0",
    resave: true,
    saveUninitialized: true,
  })
);

const jwtMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const tokenRaw = token.replace("Bearer ", "");

  jwt.verify(tokenRaw, "ljbP1rDQuy67uh9cadWnxuqhq68ENAI0", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

app.use("/customer/auth/*", jwtMiddleware);

const PORT = 3033;

app.use("/customer", customer_routes);

app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running", PORT));
