import { createStore } from 'jotai';
import { gameSnapshotAtom } from './atoms';
import { saveRecord } from './persist';

export const gameStore = createStore();

let subscribed = false;

export function subscribePersistence(): void {
  if (subscribed) return;
  subscribed = true;
  gameStore.sub(gameSnapshotAtom, () => {
    const state = gameStore.get(gameSnapshotAtom);
    saveRecord(state);
  });
}
