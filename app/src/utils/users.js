let userList = [
    // {
    //     id: "1",
    //     username: "Hoang Danh",
    //     room: "mew mew"
    // },
    // {
    //     id: "2",
    //     username: "Hoang Danh 2",
    //     room: "mew mew 2"
    // },
]

const addUser = (newUser) => userList = [...userList, newUser];

const getUserList = (room) => userList.filter((user) => user.room === room);

const removeUser = (id) => userList = userList.filter((user) => user.id !== id);

const findUser = (id) => userList.find((user) => user.id === id);

module.exports = {
    getUserList, addUser, removeUser, findUser
}