// import { configureStore } from '@reduxjs/toolkit';
// import modalSlice from './modalSlice';
// import seatReducer from './seatSlice'; // 假設你之後會寫一個管理座位的 slice

// export const store = configureStore({
//   reducer: {
//     seats: seatReducer, // 註冊你的 reducer
//     moduleState: modalSlice
//   },
// });

// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import modalSlice from './modalSlice';
import seatReducer from './seatSlice';
import { saveSeatsMiddleware, loadFromLocalStorage } from '../middleware/saveToLocalStorage';

// 從 localStorage 載入初始資料
const preloadedState = {
  seats: {
    list: loadFromLocalStorage('seatList') || []
  }
};

export const store = configureStore({
  reducer: {
    seats: seatReducer,
    moduleState: modalSlice
  },
  preloadedState, // 載入儲存的資料
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(saveSeatsMiddleware), // 加入自訂 middleware
});