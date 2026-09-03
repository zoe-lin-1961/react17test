import { useState, useRef, useCallback } from "react";
import SetRole from "./setRole";
import RoleList from "./roleList";
import { Dialog } from "../components/dialog";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from 'react-redux';
import { addRecord, updateRecord, deleteMultipleRecords } from '../store/seatSlice';

function Mainpage() {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [dialogComponent, setDialogComponent] = useState();
  const [dialogTitle, setDialogTitle] = useState("設定基本座標");
  let navigate = useNavigate();

  const setRoleRef = useRef(null);
  const setRoleListRef = useRef(null);

  const dispatch = useDispatch();
  const seatList = useSelector((state) => state.seats.list);

  // ============================================================
  //  1. 純函數工具（不依賴 React）
  // ============================================================
  
  const isDeepEqual = (arr1, arr2) => {
    if (arr1 === arr2) return true;
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    
    const sortFn = (a, b) => (a.id + a.side).localeCompare(b.id + b.side);
    const sorted1 = [...arr1].sort(sortFn);
    const sorted2 = [...arr2].sort(sortFn);
    
    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
  };

  const deduplicateById = (data) => {
    const seen = new Set();
    return data.filter(item => {
      const key = `${item.id}-${item.side}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const filterItemsToDelete = (existingList, newData) => {
    return existingList.filter(oldItem => 
      !newData.some(newItem => 
        newItem.id === oldItem.id && newItem.side === oldItem.side
      )
    );
  };

  const classifyItems = (items, existingList) => {
    const itemsToUpdate = [];
    const itemsToAdd = [];
    
    items.forEach(item => {
      const exists = existingList.some(old => 
        old.id === item.id && old.side === item.side
      );
      if (exists) {
        itemsToUpdate.push(item);
      } else {
        itemsToAdd.push(item);
      }
    });
    
    return { itemsToUpdate, itemsToAdd };
  };

  // ============================================================
  //  2. 自定義 Hook：座標同步邏輯
  // ============================================================
  
  const useSeatSync = () => {
    const syncData = useCallback((newData, sourceName) => {
      if (!newData || newData.length === 0) {
        console.log(`⚠️ ${sourceName} 無資料`);
        return { success: false, stats: {} };
      }

      console.log(`📊 獲取到的 ${sourceName} 數據:`, newData);

      // 去重
      const uniqueData = deduplicateById(newData);
      console.log(`📊 去重後共 ${uniqueData.length} 筆資料`);

      // 檢查是否相同
      if (isDeepEqual(seatList, uniqueData)) {
        console.log(`⏭️ ${sourceName} 資料與 seatList 相同，跳過更新`);
        return { success: false, stats: { skipped: true } };
      }

      // 計算差異
      const itemsToDelete = filterItemsToDelete(seatList, uniqueData);
      const { itemsToUpdate, itemsToAdd } = classifyItems(uniqueData, seatList);

      // 執行刪除
      if (itemsToDelete.length > 0) {
        console.log(`🗑️ 刪除 ${itemsToDelete.length} 筆資料`);
        dispatch(deleteMultipleRecords(
          itemsToDelete.map(item => ({ id: item.id, side: item.side }))
        ));
      }

      // 執行更新
      if (itemsToUpdate.length > 0) {
        itemsToUpdate.forEach(item => dispatch(updateRecord(item)));
        console.log(`✅ 更新 ${itemsToUpdate.length} 筆資料`);
      }

      // 執行新增
      if (itemsToAdd.length > 0) {
        itemsToAdd.forEach(item => dispatch(addRecord(item)));
        console.log(`✅ 新增 ${itemsToAdd.length} 筆資料`);
      }

      console.log(`✅ ${sourceName} 同步完成`);
      
      return {
        success: true,
        stats: {
          deleted: itemsToDelete.length,
          updated: itemsToUpdate.length,
          added: itemsToAdd.length,
        }
      };
    }, [seatList, dispatch]);

    return { syncData };
  };

  // ============================================================
  //  3. 使用自定義 Hook
  // ============================================================
  
  const { syncData } = useSeatSync();

  // ============================================================
  //  4. 對話框控制
  // ============================================================

  const openDialog = (component, title) => {
    setIsOpenDialog(true);
    setDialogComponent(component);
    setDialogTitle(title);
  };

  const toSet = () => {
    openDialog(<SetRole ref={setRoleRef} />, "設定基本座標");
  };

  const beforeSetLocations = () => {
    openDialog(<RoleList ref={setRoleListRef} />, "查詢基本座標");
  };

  const handalUploadDialog = (_isOpenDialog) => {
    if (!_isOpenDialog) {
      setIsOpenDialog(false);
      setDialogComponent(<SetRole ref={setRoleRef} />);
      setDialogTitle("請輸入基本座標(身分證座標)");
    }
  };

  // ============================================================
  //  5. 主要確認邏輯（簡潔版）
  // ============================================================

  const handalComfirm = (_isComfirm) => {
    if (!_isComfirm) return;

    console.log("🔄 開始執行存檔流程...");

    // 獲取並同步資料
    const results = [];
    
    if (setRoleRef.current) {
      const data = setRoleRef.current.getData();
      const result = syncData(data, "SetRole");
      results.push(result);
    }

    if (setRoleListRef.current) {
      const data = setRoleListRef.current.getData();
      const result = syncData(data, "RoleList");
      results.push(result);
    }

    // 檢查結果
    const hasAnySuccess = results.some(r => r?.success);
    if (!hasAnySuccess) {
      console.warn("⚠️ 所有資料源皆無效或無變更");
    }

    console.log("💾 存檔流程完成");
  };

  // ============================================================
  //  6. 清除功能
  // ============================================================

  const handleClearAll = () => {
    if (window.confirm('確定要清除所有數據嗎？')) {
      dispatch({ type: 'seats/clearRecords' });
      console.log("🗑️ 已清除所有數據");
    }
  };

  // ============================================================
  //  7. 渲染
  // ============================================================

  return (
    <div className="page flex flex-col h-screen bg-gray-50">
      <header className="text-xl text-center p-5">
        入經藏位置查詢助手
      </header>
      <div className="flex-1 flex flex-col justify-center items-center">
        <button 
          className="px-4 py-2 w-80 mb-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm" 
          onClick={toSet}
        >
          設定查詢座標
        </button>
        {seatList.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <button 
              className="px-4 py-2 w-80 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm" 
              onClick={beforeSetLocations}
            >
              找之前查過的
            </button>
            <button 
              className="px-4 py-2 w-80 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-sm" 
              onClick={handleClearAll}
            >
              清除全部數據
            </button>
          </div>
        ) : null}
        
        
        <Dialog 
          isOpen={isOpenDialog} 
          uploadDialog={handalUploadDialog} 
          comfirm={handalComfirm}
          dialogContent={dialogComponent} 
          title={dialogTitle} 
          uploadRouter={() => {navigate('/pics')}}
        />
      </div>
      <footer className="text-gray-500 text-sm border-t border-gray-200 p-2 mt-4">
      <div className="text-orange-500" >頁面更新會清掉所有數據,需要重新輸入!!</div>  
      <div className="text-orange-500" >如有不便敬請見諒</div> 
      <span className=" text-blue-600 hover:text-blue-800 
      hover:underline transition-colors duration-200"
      onClick={() => {navigate('/upgrade')}}
      >更新日誌</span> |
      <span className=" text-blue-600 hover:text-blue-800 
      hover:underline ml-1 transition-colors duration-200"
      onClick={() => {navigate('/see')}}
      >
        參考資料來源
      </span>
</footer>
    </div>
  );
}

export default Mainpage;