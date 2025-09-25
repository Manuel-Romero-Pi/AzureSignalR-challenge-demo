var connection = null
var realUserName = null
var userColors = {} // Store user colors
var colors = ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#3A86FF', '#8338EC', '#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFA5', '#FFD23F', '#F7931E', '#FF6B35']
updateConnectionStatus(false)

// Function to get a unique color for each user
function getUserColor(userName) {
    if (!userColors[userName]) {
        // Generate a color based on the user name hash
        let hash = 0;
        for (let i = 0; i < userName.length; i++) {
            hash = userName.charCodeAt(i) + ((hash << 5) - hash);
        }
        userColors[userName] = colors[Math.abs(hash) % colors.length];
    }
    return userColors[userName];
}

document.getElementById('userName').addEventListener('keydown', function (event) {
    if (!realUserName && event.key === 'Enter') {
        submitName();
    }
});

document.getElementById('chatInput').addEventListener('keydown', function (event) {
    const textValue = document.getElementById('chatInput').value;
    if (textValue && event.key === 'Enter') {
        sendMessage();
    }
});

// Add real-time @gpt recognition and preview
document.getElementById('chatInput').addEventListener('input', function (event) {
    const input = event.target;
    const value = input.value;
    const preview = document.getElementById('inputPreview');
    
    // Update the preview with formatted text
    if (value) {
        preview.innerHTML = formatMessage(value);
    } else {
        preview.innerHTML = '';
    }
});

// Clear preview when input loses focus
document.getElementById('chatInput').addEventListener('blur', function (event) {
    const preview = document.getElementById('inputPreview');
    preview.innerHTML = '';
});

// Show preview when input gains focus
document.getElementById('chatInput').addEventListener('focus', function (event) {
    const input = event.target;
    const value = input.value;
    const preview = document.getElementById('inputPreview');
    
    if (value) {
        preview.innerHTML = formatMessage(value);
    }
});

function submitName() {
    const userName = document.getElementById('userName').value;
    if (userName) {
        document.getElementById('namePrompt').classList.add('hidden');
        document.getElementById('groupSelection').classList.remove('hidden');
        document.getElementById('userNameDisplay').innerText = userName;

        realUserName = userName;
    } else {
        alert('Please enter your name');
    }
}

function createGroup() {
    const groupName = Math.random().toString(36).substr(2, 6);
    joinGroupWithName(groupName);
}

function joinGroup() {
    const groupName = document.getElementById('groupName').value;
    if (groupName) {
        joinGroupWithName(groupName);
    } else {
        alert('Please enter a group name');
    }
}

function joinGroupWithName(groupName) {
    document.getElementById('groupSelection').classList.add('hidden');
    document.getElementById('chatGroupName').innerText = 'Group: ' + groupName;
    document.getElementById('chatPage').classList.remove('hidden');

    connection = new signalR.HubConnectionBuilder().withUrl(`/groupChat`).withAutomaticReconnect().build();
    bindConnectionMessages(connection);
    connection.start().then(() => {
        updateConnectionStatus(true);
        onConnected(connection);
        connection.send("JoinGroup", groupName);
    }).catch(error => {
        updateConnectionStatus(false);
        console.error(error);
    })
}

function bindConnectionMessages(connection) {
    connection.on('newMessage', (name, message) => {
        appendMessage(false, name, message);
    });
    connection.on('newMessageWithId', (name, id, message) => {
        appendMessageWithId(id, name, message);
    });
    connection.onclose(() => {
        updateConnectionStatus(false);
    });
}

function onConnected(connection) {
    console.log('connection started');
}

function sendMessage() {
    const message = document.getElementById('chatInput').value;
    if (message) {
        appendMessage(true, realUserName, message);
        document.getElementById('chatInput').value = '';
        connection.send("Chat", realUserName, message);
    }
}

function appendMessage(isSender, userName, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = createMessageElement(userName, message, isSender, null)
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessageWithId(id, userName, message) {
    // We update the full message
    const chatMessages = document.getElementById('chatMessages');
    if (document.getElementById(id)) {
        let messageElement = document.getElementById(id);
        updateMessageContent(messageElement, userName, message);
    } else {
        let messageElement = createMessageElement(userName, "", false, id);
        chatMessages.appendChild(messageElement);
        
        // If it's ChatGPT, apply typewriter effect
        if (userName === "ChatGPT") {
            typewriterEffect(messageElement, message);
        } else {
            updateMessageContent(messageElement, userName, message);
        }
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageElement(userName, message, isSender, id) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', isSender ? 'sent-container' : 'received-container');
    
    // Create message element
    const messageElement = document.createElement('div');
    if (userName === 'ChatGPT') {
        messageElement.classList.add('message', 'chatgpt');
    } else {
        messageElement.classList.add('message', isSender ? 'sent' : 'received');
    }
    
    // Create user name element inside the message
    const userNameElement = document.createElement('div');
    userNameElement.classList.add('user-name');
    userNameElement.style.color = getUserColor(userName);
    
    // Show "Tú" for sent messages, actual name for received messages
    if (isSender) {
        userNameElement.textContent = 'Tú';
    } else {
        userNameElement.textContent = userName;
    }
    
    // Create message content element
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = formatMessage(message);
    
    // Add name and content to message element
    messageElement.appendChild(userNameElement);
    messageElement.appendChild(messageContent);
    
    messageContainer.appendChild(messageElement);
    
    if (id) {
        messageContainer.id = id;
    }
    
    return messageContainer;
}

function updateMessageContent(messageElement, userName, message) {
    const userNameElement = messageElement.querySelector('.user-name');
    const messageContent = messageElement.querySelector('.message-content');
    const messageDiv = messageElement.querySelector('.message');
    
    // Update message class for ChatGPT
    if (userName === 'ChatGPT') {
        messageDiv.className = 'message chatgpt';
    }
    
    if (userNameElement) {
        userNameElement.style.color = getUserColor(userName);
        userNameElement.textContent = userName;
    }
    
    if (messageContent) {
        messageContent.innerHTML = formatMessage(message);
    }
}

function formatMessage(message) {
    // Make @gpt bold
    return message.replace(/@gpt/g, '<strong>@gpt</strong>');
}

function typewriterEffect(messageElement, fullMessage) {
    const messageContent = messageElement.querySelector('.message-content');
    if (!messageContent) return;
    
    let currentIndex = 0;
    const speed = 10; // milliseconds per character
    
    function typeNextCharacter() {
        if (currentIndex < fullMessage.length) {
            const currentText = fullMessage.substring(0, currentIndex + 1);
            messageContent.innerHTML = formatMessage(currentText);
            currentIndex++;
            
            // Scroll to bottom
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            setTimeout(typeNextCharacter, speed);
        }
    }
    
    typeNextCharacter();
}

function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    if (isConnected) {
        statusElement.innerText = 'Connected';
        statusElement.classList.remove('status-disconnected');
        statusElement.classList.add('status-connected');
    } else {
        statusElement.innerText = 'Disconnected';
        statusElement.classList.remove('status-connected');
        statusElement.classList.add('status-disconnected');
    }
}