import { Server } from 'socket.io';

const io = new Server(9000, {
    cors: {
        origin: ["http://localhost:3000", 'https://vchat-p2p.web.app']
    }
});

let users = [];

const addUser = (userData, socketId) => {
    const existingUser = users.find(user => user.sub === userData.sub);
    if (existingUser) {
        existingUser.socketId = socketId;
    } else {
        users.push({ ...userData, socketId });
    }
};

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

const getUser = (data) => {
    const userDetails = users.find(user => user.sub === data);
    // console.log(userDetails)
    return userDetails;
}

io.on('connection', (socket) => {
    console.log("User connected");

    socket.on("addUser", userData => {
        addUser(userData, socket.id);
        io.emit("getUsers", users);
    });

    socket.on("sendMessage", data => {
        const user = getUser(data.receiverId);
        io.to(user.socketId).emit('getMessage', data);
    })

    socket.on('disconnect', () => {
        console.log("User disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
