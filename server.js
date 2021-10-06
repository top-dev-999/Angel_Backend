const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const config = require("./config/config");

const authRoutes = require("./src/api/auth/auth-routes");
const accountRoutes = require("./src/api/account/account-routes");
const adminRoutes = require("./src/api/admin/admin-routes");
const messageRoutes = require("./src/api/message/message-routes");
const productRoutes = require("./src/api/product/product-routes");
const orderRoutes = require("./src/api/account/order/order-routes");

const tcp = require("./src/socket/tcp-server");
const webSocket = require("./src/socket/websocket");
const middleware = require("./src/utilities/middleware");

const aura = require("./src/aura/aura-service");

const app = express();
const server = require('http').createServer(app);

// connect to the db
mongoose.connect(config.database, { useNewUrlParser: true });
mongoose.connection.on("connected", () => {
    console.log("Database Connected: " + config.database);
});

// host api
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("*", middleware.authentication);

app.use("/api/auth", authRoutes);
app.use("/api/user", accountRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);

webSocket.init(server);
// host tcp socket
tcp.startTCPServer();

app.get("/test", (req, res) => {
    res.send("testing...");
});


// host the website
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});


const port = process.env.PORT || config.API_PORT;
server.listen(port, () => console.log(`API running on localhost:${port}`));