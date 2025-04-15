const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// statische Dateien
app.use(express.static(path.join(__dirname, "public")));

const cities = ["köln"];

const chatRooms = {};

io.on("connection", (socket) => {
  console.log("Ein Nutzer ist verbunden");

  socket.on("joinCity", (city) => {
    if (!cities.includes(city)) return;
    socket.join(city);
    socket.city = city;
    io.to(city).emit("chat message", `📢 Neuer Nutzer im ${city}-Chat`);
  });

  socket.on("chat message", (msg) => {
    if (socket.city) {
      io.to(socket.city).emit("chat message", msg);
    }
  });
  

  socket.on("disconnect", () => {
    if (socket.city) {
      io.to(socket.city).emit("chat message", "🚪 Nutzer hat den Chat verlassen");
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
