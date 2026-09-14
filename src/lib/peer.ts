import Peer from 'peerjs';

// Create a Peer instance with optional custom ID
export const createPeer = (peerId?: string) => {
  const host = process.env.NEXT_PUBLIC_PEERJS_HOST || undefined;
  const port = process.env.NEXT_PUBLIC_PEERJS_PORT ? Number(process.env.NEXT_PUBLIC_PEERJS_PORT) : undefined;
  const secure = true; // use wss by default
  return new Peer(peerId, { host, port, secure });
};

// Wrapper to call a remote peer with a media stream
export const callPeer = (peer: Peer, remoteId: string, stream: MediaStream) => {
  const call = peer.call(remoteId, stream);
  return call;
};

// Answer an incoming call with the local media stream
export const answerCall = (call: Peer.MediaConnection, stream: MediaStream) => {
  call.answer(stream);
  return call;
};
