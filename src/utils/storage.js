const KEY = 'mcq_participants';

export function getParticipants() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

export function saveParticipant(participant) {
  const all = getParticipants();
  all.push(participant);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearParticipants() {
  localStorage.removeItem(KEY);
}
