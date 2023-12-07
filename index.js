const { connectToWhatsApp, sendWhatsAppMessage, } = require("./whatsappBot");

//connectToWhatsApp(algenerarQR, alRecibirMensajes, alEstablecerConexion)
connectToWhatsApp(
  (qrCode) => {
    console.log('Received QR code:', qrCode);
  },
  (content, sender) => {
    console.log(`Sender: ${sender}, Message: ${content}`);
  },
  (isConnected) => {
    isConnected && sendWhatsAppMessage("hola desde el back", "numero##");
  }
);