# WhatsApp Bot

This is a simple WhatsApp bot built with Node.js using the @whiskeysockets/baileys library. It allows you to connect to WhatsApp, receive QR codes for authentication, and send messages.

## Usage

Import the WhatsApp bot functions in your script:

```javascript
const { connectToWhatsApp, sendWhatsAppMessage } = require("./whatsappBot");

// Usage example:
connectToWhatsApp(
  // Callback function when a QR code is received
  (qrCode) => {
    console.log("Received QR code:", qrCode);
  },
  // Callback function when a message is received
  (content, sender) => {
    console.log(`Sender: ${sender}, Message: ${content}`);
  },
  // Callback function when the connection is established
  (isConnected) => {
    isConnected &&
      sendWhatsAppMessage("Hello from the backend!", "recipientNumber");
  }
);
```
