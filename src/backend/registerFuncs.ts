import { registerBackendEvents } from './events';
import { registerProcessorEvents } from './processors/eventRegister';

export const registerFuncs =  [
    registerBackendEvents,
    registerProcessorEvents
]