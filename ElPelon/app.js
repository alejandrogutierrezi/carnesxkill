// Initialize jsPDF
const { jsPDF } = window.jspdf;

// Local server endpoints
const ORDER_PROCESSING_URL = '/process-order';
const IMAGE_PROCESSING_URL = '/process-images';

const chatMessages = document.getElementById('chat-messages');
const userMessageInput = document.getElementById('user-message');
const sendButton = document.getElementById('send-btn');
const imageUploadForm = document.getElementById('image-upload-form');
const imageResultsContainer = document.getElementById('image-results');

sendButton.addEventListener('click', sendMessage);
userMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
imageUploadForm.addEventListener('submit', handleImageUpload);

function sendMessage() {
    const message = userMessageInput.value.trim();
    if (message) {
        addMessageToChat('user', message);
        userMessageInput.value = '';
        processOrder(message);
    }
}

function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function processOrder(userMessage) {
    try {
        const response = await fetch(ORDER_PROCESSING_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            throw new Error('Failed to process order');
        }

        const data = await response.json();
        const botResponse = data.response;
        addMessageToChat('bot', botResponse);
        generateOrderPDF(botResponse);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('bot', 'Sorry, there was an error processing your order. Please try again.');
    }
}

function generateOrderPDF(orderDetails) {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('El Pelon - Order Details', 105, 20, null, null, 'center');
    
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(orderDetails, 180);
    doc.text(splitText, 15, 40);
    
    doc.save('el_pelon_order.pdf');
    
    addMessageToChat('bot', 'Your order PDF has been generated and downloaded.');
}

async function handleImageUpload(event) {
    event.preventDefault();
    const formData = new FormData(imageUploadForm);
    
    try {
        const response = await fetch(IMAGE_PROCESSING_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to process images');
        }

        const data = await response.json();
        displayImageResults(data);
    } catch (error) {
        console.error('Error:', error);
        imageResultsContainer.innerHTML = '<p>Sorry, there was an error processing your images. Please try again.</p>';
    }
}

function displayImageResults(results) {
    imageResultsContainer.innerHTML = '';
    
    const summaryElement = document.createElement('div');
    summaryElement.innerHTML = `<h3>Order Summary</h3>
        <p>Total Items: ${results.items.length}</p>
        <p>Total Amount: $${results.total.toFixed(2)}</p>`;
    imageResultsContainer.appendChild(summaryElement);

    const itemsList = document.createElement('ul');
    results.items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name}: $${item.price.toFixed(2)}`;
        itemsList.appendChild(listItem);
    });
    imageResultsContainer.appendChild(itemsList);

    addMessageToChat('bot', `I've analyzed your receipt images. The total order amount is $${results.total.toFixed(2)}. You can see the full breakdown in the Receipt Analysis Results section.`);
}