import { useSelector } from 'react-redux';
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

function RoleList(props, ref) {
  const seatList = useSelector((state) => state.seats.list);
  const [ids, setIds] = useState(seatList || []);

  // 💡 監聽 Redux 變化，同步更新本地 state
  useEffect(() => {
    setIds(seatList || []);
  }, [seatList]);

  // 使用 useImperativeHandle 暴露數據給父組件
  useImperativeHandle(ref, () => ({
    getData: () => {
      return ids;
    },
    getIdsCount: () => {
      return ids.length;
    },
    resetIds: () => {
      setIds([]);
    }
  }));

  function removeRecored(_item) {
    setIds(prevIds => prevIds.filter(item => !(item.id === _item.id && item.side === _item.side)));
  }

  function toHidden(_item) {
    setIds(prevIds => 
      prevIds.map(item => 
        (item.id === _item.id && item.side === _item.side) 
          ? { ...item, hidden: true } 
          : item
      )
    );
  }

  function toShow(_item) {
    setIds(prevIds => 
      prevIds.map(item => 
        (item.id === _item.id && item.side === _item.side) 
          ? { ...item, hidden: false } 
          : item
      )
    );
  }

  function changeName(item, e) {
    const name = e.target.value;
    setIds(prevIds => 
      prevIds.map(prevItem => 
        (prevItem.id === item.id && prevItem.side === item.side) 
          ? { ...prevItem, name: name } 
          : prevItem
      )
    );
    console.log(`✏️ 更新姓名: ${item.id} (${item.side}) -> ${name}`);
  }

  return (
    <>
      <div className="flex gap-2 mb-3 border-b pb-2 border-gray-100">這裡可以設定地標顯示的名字</div>
      <div className="flex gap-2 mb-3 border-b pb-2 border-gray-100">☀️:在地圖顯示,🌑:在地圖不顯示</div>

      {ids.length > 0 ? (
        ids.map((item) => (
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 max-w-sm mb-2" key={item.id + item.side}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                {!item.hidden ? (
                  <span onClick={() => toHidden(item)} className="cursor-pointer">☀️</span>
                ) : (
                  <span onClick={() => toShow(item)} className="cursor-pointer">🌑</span>
                )}
                <span>{item.side === 'L' ? '西班' : '東班'} {item.id}</span>
              </div>
              
              <div className="relative flex items-center flex-1 max-w-[150px]">
                <input 
                  type='text'
                  placeholder="姓名/法號" 
                  value={item.name || ''}  // 💡 加上 || '' 避免 undefined
                  onChange={(e) => changeName(item, e)} 
                  className="w-full pl-3 pr-7 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium rounded-full shadow-sm transition duration-150 ease-in-out" 
                onClick={() => removeRecored(item)}
              >
                刪除
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-4">尚無任何座標資料</div>
      )}
    </>
  );
}

export default forwardRef(RoleList);