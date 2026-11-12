// Archiviazione locale: sessione in corso e storico degli esiti
import { HISTORY_KEY, STORAGE_KEY, state } from "./state.js";

export function safeStorageGet() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function safeStorageSet(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* La simulazione resta utilizzabile anche senza archiviazione locale. */
  }
}

export function safeStorageRemove() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* La simulazione resta utilizzabile anche senza archiviazione locale. */
  }
}

export function loadHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* La simulazione resta utilizzabile anche senza archiviazione locale. */
  }
}

export function saveExam() {
  if (state.exam) safeStorageSet(state.exam);
}
