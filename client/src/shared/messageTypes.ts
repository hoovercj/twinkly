// TODO: Currently this is located in the client/src/shared because
// create-react-app restricts referencing code outside of the src directory.
// This code should instead be moved to an npm module and linked as part of
// setup scripts for this project, or some alternative method should be used
// so the code can be moved to a shared folder outside of /client and /server

export enum TwinklyStatus {
    Unavailable = 'unavailable',
    Available = 'available',
    Busy = 'busy',
    Connected = 'connected',
}

export interface TwinklyStatusResponse {
    status: TwinklyStatus;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export enum MessageType {
    Invalid = 'invalid',
    StatusRequest = 'statusRequest',
    StatusResponse = 'statusResponse',
    SetLights = 'setLights',
    ControlLightsRequest = 'controlLightsRequest',
}

export interface Message<T extends MessageType, K> {
    type: T,
    payload: K,
}

export type InvalidMessage = Message<MessageType.Invalid, string>;
export type StatusRequestMessage = Message<MessageType.StatusRequest, void>;
export type StatusResponseMessage = Message<MessageType.StatusResponse, TwinklyStatus>;
export type SetLightsMessage = Message<MessageType.SetLights, RGB[][]>;
export type ControlLightsMessage = Message<MessageType.ControlLightsRequest, boolean>;
