import { LockManager } from './managers/lock';

export function registerLockEvents() {
    LockManager.instance.register();
}