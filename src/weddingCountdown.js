import { wedding } from './content.js';

const ceremonyTime = Date.parse(wedding.ceremonyStartsAt);

export function weddingCountdown(now = Date.now()) {
  const totalSeconds = Math.max(0, Math.ceil((ceremonyTime - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    started: totalSeconds === 0,
  };
}
