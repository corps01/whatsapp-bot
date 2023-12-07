const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const log = require("pino")({ level: "silent" });
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode");

let sock;

async function connectToWhatsApp(onQRCode, onMessage, onConnected) {
    const { state, saveCreds } = await useMultiFileAuthState("session_auth_info");

    sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: log,
    });

    sock.ev.on("connection.update", (update) => handleConnectionUpdate(update, onQRCode, onConnected));
    sock.ev.on('messages.upsert', (m) => handleIncomingMessage(m, onMessage))
    sock.ev.on("creds.update", saveCreds);
}

const handleIncomingMessage = (m, onMessage) => {
    if (m.messages) {
        m.messages.forEach(message => {
            if (message.message) {

                const sender = message.key.remoteJid;
                const content = message.message.conversation || '';
                if (onMessage) onMessage(content, sender);
            }
        });
    }
}

const handleConnectionUpdate = async (update, onQRCode, onConnected) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === "close") {
        handleConnectionClose(lastDisconnect);
    } else if (connection === "open") {
        !!sock?.user && onConnected(true)
        console.log("conexión abierta");
    }

    if (qr && onQRCode) {
        onQRCode(await qrcode.toDataURL(qr));
    }
}

function handleConnectionClose(lastDisconnect) {
    const { error } = lastDisconnect;
    const reason = new Boom(error).output.statusCode;

    switch (reason) {
        case DisconnectReason.badSession:
            console.log(`Bad Session File, Please Delete and Scan Again`);
            sock.logout();
            break;
        case DisconnectReason.connectionClosed:
        case DisconnectReason.connectionLost:
        case DisconnectReason.restartRequired:
        case DisconnectReason.timedOut:
            console.log("Reconnecting...");
            connectToWhatsApp();
            break;
        case DisconnectReason.connectionReplaced:
            console.log("Connection replaced, close the current session first");
            sock.logout();
            break;
        case DisconnectReason.loggedOut:
            console.log(`Device closed, delete and scan again.`);
            sock.logout();
            break;
        default:
            sock.end(`Unknown disconnection reason: ${reason}|${error}`);
    }
}

const isConnected = () => !!sock?.user;

const sendWhatsAppMessage = async (tempMessage, number) => {
    if (!number) {
        return {
            status: false,
            response: "El numero no existe",
        };
    }

    const numberWA = "521" + number + "@s.whatsapp.net";

    if (!isConnected()) {
        return {
            status: false,
            response: "Aun no estas conectado",
        };
    }

    const exist = await sock.onWhatsApp(numberWA);

    if (exist?.jid || (exist && exist[0]?.jid)) {
        const result = await sock.sendMessage(exist.jid || exist[0].jid, {
            text: tempMessage,
        });
        return {
            status: true,
            response: result,
        };
    }

    return {
        status: false,
        response: "Invalid recipient",
    };
};

module.exports = {
    connectToWhatsApp,
    isConnected,
    sendWhatsAppMessage,
};
