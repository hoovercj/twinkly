import './App.css';

import React, { useCallback, useEffect, useState } from 'react';
import { Snake } from './components/Snake';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {
  TwinklyStatus,
  Message,
  MessageType,
  ControlLightsMessage,
  StatusResponseMessage,
  SetLightsMessage
} from './shared/messageTypes';
import { RGB } from './components/LightMatrix';

// TODO: Read from env variable
const webSocketUrl = 'ws://localhost:8000';

function App():JSX.Element {
  const [status, setStatus] = useState<TwinklyStatus>(TwinklyStatus.Unavailable);

  const {
    sendJsonMessage,
    lastJsonMessage,
    readyState,
  } = useWebSocket(webSocketUrl);

  useEffect(() => {
    if (readyState !== ReadyState.OPEN) {
      setStatus(TwinklyStatus.Unavailable);
      return;
    }

    const typedJsonMessage: Message<any, any> | null = lastJsonMessage;
    switch ((typedJsonMessage)?.type) {
      case MessageType.StatusResponse:
        setStatus((typedJsonMessage as StatusResponseMessage).payload);
        return;
      default:
        // Ignore unknown messages
        break;
    }
  }, [lastJsonMessage, setStatus, readyState]);

  const connectLights = useCallback(() => {
    if (status === TwinklyStatus.Available) {
      sendJsonMessage({
        type: MessageType.ControlLightsRequest,
        payload: true,
      } as ControlLightsMessage);
    }
  }, [sendJsonMessage, status]);

  const disconnectLights = useCallback(() => {
    if (status === TwinklyStatus.Connected) {
      sendJsonMessage({
        type: MessageType.ControlLightsRequest,
        payload: false,
      } as ControlLightsMessage);
    }

  }, [sendJsonMessage, status]);

  const updateLights = useCallback((lights: RGB[][]) => {
    if (status === TwinklyStatus.Connected) {
      sendJsonMessage({
        type: MessageType.SetLights,
        payload: lights,
      } as SetLightsMessage);
    }
  }, [status, sendJsonMessage]);

  // TODO: render a "Connect lights" button when status is available
  // TODO: render a "Disconnect lights" button when status is connected
  // TODO: render a "busy" or "unavailable" status when appropriate
  // TODO: When connected, send frames to the server

  return (
    <div className='app'>
      <div className='header'>
        <div className='name'>Twinkly Snake</div>
        <StatusMessage
          status={status}
          connect={connectLights}
          disconnect={disconnectLights}
        />
      </div>
      <div className='body'>
        <Snake onLightsChanged={updateLights}/>
      </div>
    </div>
  );
}

interface StatusProps {
  status: TwinklyStatus;
  connect: () => void;
  disconnect: () => void;
}

function StatusMessage(props: StatusProps): JSX.Element {
  switch(props.status) {
    case TwinklyStatus.Unavailable:
    case TwinklyStatus.Busy:
      return <span>Lights: {props.status}</span>;
    case TwinklyStatus.Connected:
      return <button onClick={props.disconnect}>Disconnect lights</button>;
      case TwinklyStatus.Available:
      return <button onClick={props.connect}>Connect lights</button>;
  }
}

export default App;
