import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [], 
};

export const seatSlice = createSlice({
  name: 'seats',
  initialState,
  reducers: {
    // 新增資料
    addRecord: (state, action) => {
      state.list.push(action.payload);
    },
    
    // 刪除資料
    removeRecord: (state, action) => {
      state.list = state.list.filter(
        item => !(item.id === action.payload.id && item.side === action.payload.side)
      );
    },

    // 修改資料（通用）
    updateRecord: (state, action) => {
      const { id, side, ...updatedFields } = action.payload;
      const targetItem = state.list.find(
        item => item.id === id && item.side === side
      );
      if (targetItem) {
        Object.assign(targetItem, updatedFields);
      }
    },

    // 💡 新增：更新姓名
    updateName: (state, action) => {
      const { id, side, name } = action.payload;
      const targetItem = state.list.find(
        item => item.id === id && item.side === side
      );
      if (targetItem) {
        targetItem.name = name;
      }
    },

    // 💡 新增：切換隱藏狀態
    toggleHidden: (state, action) => {
      const { id, side } = action.payload;
      const targetItem = state.list.find(
        item => item.id === id && item.side === side
      );
      if (targetItem) {
        // 如果 hidden 不存在，預設為 false，然後切換
        targetItem.hidden = !targetItem.hidden;
      }
    },

    // 💡 新增：清空所有資料
    clearRecords: (state) => {
      state.list = [];
    },

    // 💡 刪除：批次刪除資料
    deleteMultipleRecords: (state, action) => {
      // action.payload 是一個包含 { id, side } 的陣列
      const itemsToDelete = action.payload;
      
      // 從 list 中過濾掉要刪除的項目
      state.list = state.list.filter(
        item => !itemsToDelete.some(
          deleteItem => deleteItem.id === item.id && deleteItem.side === item.side
        )
      );
    },

    // 💡 新增：批次新增資料
    addMultipleRecords: (state, action) => {
      state.list.push(...action.payload);
    },
  },
});

export const { 
  addRecord, 
  removeRecord, 
  updateRecord, 
  deleteMultipleRecords,
  updateName,      // 匯出 updateName
  toggleHidden,    // 匯出 toggleHidden
  clearRecords,    // 匯出 clearRecords
  addMultipleRecords // 匯出 addMultipleRecords
} = seatSlice.actions;

export default seatSlice.reducer;