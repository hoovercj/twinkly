import express from 'express';
import ws from 'ws';
import http from 'http';
import chalk from 'chalk';

import {
  Message,
  MessageType,
  ControlLightsMessage,
  InvalidMessage,
  SetLightsMessage,
  StatusResponseMessage,
  TwinklyStatus,
} from '../client/src/shared/messageTypes';

// TODO: Get the status from the lights
let twinklyAvailable: boolean = true;
let connectedWs: ws | null = null;

const app = express();
const server = http.createServer(express);
const wss = new ws.Server({ server });

const PORT = 8000;
app.get('/', (req, res) => res.send('Express + TypeScript Server is awesome!'));

wss.on('connection', (ws) => {
  ws.on('message', (message: string) => {
    console.log('received: %s', message);

    const parsedMessage: Message<any, any> = JSON.parse(message);
    switch (parsedMessage?.type) {
      case MessageType.StatusRequest:
        handleStatusRequest(ws);
        break;
      case MessageType.ControlLightsRequest:
        handleControlLightsRequest(ws, parsedMessage);
      break;
      case MessageType.SetLights:
          handleSetLightsRequest(ws, parsedMessage);
        break;
      default:
        sendWsMessage(ws, {
            type: MessageType.Invalid,
            payload: message,
          } as InvalidMessage
        );
        break;
    }
  });

  ws.on('close', () => {
    if (connectedWs === ws) {
      connectedWs = null;
      sendStatusResponses();
    }
  });

  // Send the current status to the newly connected device
  sendStatusResponse(ws);
});

// TODO: Alternatively, attach upgrade listener to server
// and call wss.handleUpgrade and change this to app.listen
server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

const sendWsMessage = (ws: ws, message: Message<any, any>) => {
  ws.send(JSON.stringify(message));
}

const getStatusForWs = (ws: ws): TwinklyStatus => {
  if (twinklyAvailable) {
    if (connectedWs) {
      return connectedWs === ws
        ? TwinklyStatus.Connected
        : TwinklyStatus.Busy;
    } else {
      return TwinklyStatus.Available;
    }
  } else {
    return TwinklyStatus.Unavailable;
  }
}

const sendStatusResponse = (ws: ws) => {
  const status = getStatusForWs(ws);

  console.log(`Sending status response: ${status}`);

  sendWsMessage(ws, {
      type: MessageType.StatusResponse,
      payload: status,
    } as StatusResponseMessage
  );
}

const handleStatusRequest = (ws: ws) => {
  sendStatusResponse(ws);
}

const handleControlLightsRequest = (ws: ws, message: ControlLightsMessage) => {
  if (twinklyAvailable) {
    const connect = message.payload;
    if (connect && !connectedWs) {
      connectedWs = ws;
      sendStatusResponses();
      return;
    } else if (!connect && connectedWs === ws) {
      connectedWs = null;
      sendStatusResponses();
      return;
    }
  }

  // Inform the client that it can't take control
  sendStatusResponse(ws);
}

const sendStatusResponses = () => {
  wss.clients.forEach(sendStatusResponse);
}

const handleSetLightsRequest = (ws: ws, message: SetLightsMessage): void => {
  if (ws !== connectedWs) {
    // Inform the client that it can't set the lights
    sendStatusResponse(ws);
    return;
  }

  // TODO: push to lights
  // If space characters don't work, use this: •
  console.log('\n' + message.payload.map(row => {
    return row.map(cell => {
      const { r, g, b } = cell;
      return chalk.bgRgb(r, g, b)(' ');
    }).join('');
  }).join('\n'));
}