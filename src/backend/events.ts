import { LockManager } from './managers/lock';

export function registerBackendEvents() {
    LockManager.instance.register();
}