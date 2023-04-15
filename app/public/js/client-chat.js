const socket = io();

// Send message
document.getElementById("form-messages").addEventListener('submit', (e) => {
    e.preventDefault();

    const messageText = document.getElementById("input-messages").value;

    const acknowledgements = (errors) => {
        if(errors) {
            return alert(errors);
        }
        // console.log("Success send mess");
    }

    // Send to Server
    socket.emit("send message from client to server", messageText, acknowledgements);
})

// Nhận mess được gửi từ phía server
socket.on("send message from server to client", (message) => {
    // console.log("messageText: ", message);

    const { createAt, messagesText, username } = message;

    // Get current Text chat
    const htmlContent = document.getElementById("app__messages").innerHTML;

    // Create new message
    const messagesElement = `
        <div class="message-item">
            <div class="message__row1">
                <p class="message__name">${username}</p>
                <p class="message__date">${createAt}</p>
            </div>
            <div class="message__row2">
                <p class="message__content">
                    ${messagesText}
                </p>
            </div>
        </div>
    `;

    // Make a String from current and new message
    let contentRender = htmlContent + messagesElement;

    // Push to html file
    document.getElementById("app__messages").innerHTML = contentRender;

    // Clear input
    document.getElementById("input-messages").value = "";
})

// Send location
document.getElementById("btn-share-location").addEventListener('click', () => {
    // Trình duyệt không hỗ trợ
    if(!navigator.geolocation) {
        return alert("This browser doesn't support share loction");
    }

    // Get position
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        // Send to server
        socket.emit("share location from client to server", { latitude, longitude })
    })
})

// Get Location from Server
socket.on("share location from server to client", (objLocation) => {
    const { createAt, messagesText, username } = objLocation;

    // Get current Text chat
    const htmlContent = document.getElementById("app__messages").innerHTML;

    // Create new message
    const messagesElement = `
        <div class="message-item">
            <div class="message__row1">
                <p class="message__name">${username}</p>
                <p class="message__date">${createAt}</p>
            </div>
            <div class="message__row2">
                <p class="message__content">
                    <a href="${messagesText}" target="_blank">
                        Location of ${username}
                    </a>
                </p>
            </div>
        </div>
    `;

    // Make a String from current and new message
    let contentRender = htmlContent + messagesElement;

    // Push to html file
    document.getElementById("app__messages").innerHTML = contentRender;
})

// Handle query string
const queryString = location.search;

// Lấy thông số query params
const params = Qs.parse(queryString, {
    ignoreQueryPrefix: true,
});

// Lấy params Room và Username
const { room, username } = params;

// Send all query params to server
socket.emit("join room", { room, username });

// Show name of room to html file
document.getElementById("app__title").innerHTML = room;

// Handle User List
socket.on("send user list from server to client", (userList) => {
    // console.log(userList);

    let contentHtml = '';

    // Make Username in String
    userList.map((user) => {
        contentHtml += `<li class="app__item-user">${user.username}</li>`
    })

    // Push to file chat.html
    document.getElementById("app__list-user--content").innerHTML = contentHtml;
})