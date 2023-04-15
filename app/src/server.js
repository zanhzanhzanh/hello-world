const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatTime = require("date-format");
const { createMessages } = require("./utils/create-messages");
const { getUserList, addUser, removeUser, findUser } = require("./utils/users");
// Class
const Filter = require("bad-words");

const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));
const server = http.createServer(app);
const io = socketio(server);

let count = 1;
const messages = "chào mọi người";

io.on("connection", (socket) => {
    // Thực hiện việc chia phòng khi nhận được query params từ client
    socket.on("join room", ({ room, username }) => {
        // Join room và dùng method .to room tương ứng cho các method bên dưới
        socket.join(room);

        // Say Welcome
        // Gửi cho client vừa mới kết nối
        socket.emit("send message from server to client", createMessages(`Welcome to Chat Online in Room: ${room}`, "Admin"));

        // Dùng broadcast để gửi cho tất cả nhưng trừ client đang tương tác
        socket.broadcast.to(room).emit("send message from server to client", createMessages(`${username} just joined Room: ${room}`, "Admin"));

        // Chat
        socket.on("send message from client to server", (messageText, callback) => {
            // Init Class for bad-words
            const filter = new Filter();

            // Nếu tin nhắn có bad-words thì thông báo fail
            if(filter.isProfane(messageText)) {
                return callback("Can't send because badword");
            }

            // Find User by Id to get username
            const id = socket.id;
            const user = findUser(id);

            // Dùng io để tất cả client đều nhận được, socket chỉ gửi cho chính client đang tương tác
            io.to(room).emit("send message from server to client", createMessages(messageText, user.username));

            // Khi gửi tin nhắn lên server và emit cho các client khác thành công sẽ thông báo
            callback();
        })

        // Handle share location
        socket.on("share location from client to server", ({ latitude, longitude }) => {
            const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;

            // Find User by Id to get username
            const id = socket.id;
            const user = findUser(id);

            io.to(room).emit("share location from server to client", createMessages(linkLocation, user.username));
        })

        // Add User
        const newUser = {
            id: socket.id,
            username,
            room,
        };
        addUser(newUser);

        // Handle UserList
        io.to(room).emit("send user list from server to client", getUserList(room));

        // Ngắt kết nối
        socket.on("disconnect", () => {
            // Remove User
            removeUser(socket.id);

            // Send User List Again
            io.to(room).emit("send user list from server to client", getUserList(room));

            console.log("client left server");
        })
    })

})

const port = 3000;
server.listen(port, () => {
    console.log(`app run on port: ${port}`);
})