// Main exports for the audiom-embedder package

export { AudiomEmbedConfig } from './AudiomEmbedConfig';
export type { IAudiomEmbedConfig, Coordinates } from './AudiomEmbedConfig';

export { AudiomSource } from './AudiomSource';
export type { IAudiomSource } from './AudiomSource';

export { StepSize } from './StepSize';

export { AudiomMessageHandler } from './AudiomMessages';
export type { 
  AudiomMessage,
  AudiomEvent,
  MapReadyMessage,
  LocationChangeMessage,
  ErrorMessage,
  MessageHandler 
} from './AudiomMessages';
