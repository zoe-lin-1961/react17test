import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    isOpen: false, // 初始狀態
  },
  reducers: {
    setIsOpen: (state, action) => {
      // 在這裡打印出從外部 dispatch 傳進來的最新值
      console.log("modalSlice 內接收到的 payload 值：", action.payload);

      // 同時也可以印出當前 store 裡原本的舊狀態
      console.log("更改前的 state.isOpen：", state.isOpen);

      // 賦值
      state.isOpen = action.payload; 

      // 印出修改後的最新狀態
      console.log("更改後的 state.isOpen：", state.isOpen);
    },
    toggleIsOpen: (state) => {
      state.isOpen = !state.isOpen;
      console.log("toggle 後的 state.isOpen：", state.isOpen);
    },
  },
});

export const { setIsOpen, toggleIsOpen } = modalSlice.actions;
export default modalSlice.reducer;