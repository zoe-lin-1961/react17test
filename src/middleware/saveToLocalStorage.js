// src/middleware/saveToLocalStorage.js

// 從 localStorage 載入資料
export const loadFromLocalStorage = (key) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error(`載入 localStorage (${key}) 失敗:`, err);
    return undefined;
  }
};

// 儲存到 localStorage
export const saveToLocalStorage = (key, data) => {
  try {
    const serializedState = JSON.stringify(data);
    localStorage.setItem(key, serializedState);
  } catch (err) {
    console.error(`儲存到 localStorage (${key}) 失敗:`, err);
  }
};

// 建立自動儲存中間件（只針對 seats）
export const saveSeatsMiddleware = (store) => (next) => (action) => {
  // 先執行 action
  const result = next(action);
  
  // 只針對 seats 相關的 action 進行儲存
  if (action.type && action.type.startsWith('seats/')) {
    try {
      const state = store.getState();
      saveToLocalStorage('seatList', state.seats.list);
    } catch (err) {
      console.error('自動儲存 seats 失敗:', err);
    }
  }
  
  return result;
};