import { useNavigate } from "react-router";

export default function See() {
  const navigate = useNavigate();

  return (
    <div className='page flex flex-col h-screen bg-gray-50 justify-center'>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative w-[90%] h-[90%] mx-auto">
        {/* 回上頁按鈕 */}
        <button 
            className="absolute top-4 right-4 px-4 py-2 text-xs font-medium text-white 
                    bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 
                    active:scale-95 transition-all duration-150"
            onClick={() => navigate('/')}
        >
            ← 回上頁
        </button>
        
        {/* 標題 */}
        {/* <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
            <span className="text-2xl">📝</span>
            <h3 className="text-xl font-bold text-gray-800">參考資料來源</h3>
        </div> */}
        
        {/* 更新內容 */}
        <div className="space-y-6 mt-10">
        <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-gray-400">📌</span>
      本功能參考自 
      <a 
        href="https://seat-lookup.qori.workers.dev/seat_lookup" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 hover:underline font-medium"
      >
        「大巨蛋座位查詢」
      </a>
    </div>
    <div className="text-sm text-gray-500 leading-relaxed">
      衷心感謝「大巨蛋座位查詢」開發團隊，以及參與企劃編撰與種子團隊的所有夥伴， 
      感謝你們的無私奉獻。
    </div>
    <div className="text-sm text-gray-400 leading-relaxed">
      本功能僅供友善參考，作為練習時的位置對照，希望能幫助大家更快速找到對應座位。 
      若有任何不妥之處，敬請不吝指教。
    </div>
        </div>
        </div>
        </div>
        </div>
    </div>
    
  );
}