import { useNavigate } from "react-router";

export default function Upgrade() {
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
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
            <span className="text-2xl">📝</span>
            <h3 className="text-xl font-bold text-gray-800">更新日誌</h3>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            v1.1.0
            </span>
        </div>
        
        {/* 更新內容 */}
        <div className="space-y-6">
            {/* Bug 修復 */}
            <div className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5 text-lg">●</span>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-gray-800">🐛 修復 Bug</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    2026-09-03
                </span>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-600 pl-2">
                <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>相同身分證東班西班同時加名字的問題</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>選中的身分證位置在身分證地圖不存在也能輸入的問題</span>
                </li>
                </ul>
            </div>
            </div>

            {/* 新增功能範例（可取消註解） */}
            <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-0.5 text-lg">●</span>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-gray-800">✨ 新增功能</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    2026-09-03
                </span>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-600 pl-2">
                <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>新增 "更新日誌" , "參考資料來源"</span>
                </li>
                </ul>
            </div>
            </div>
        </div>
        </div>
    </div>
    
  );
}