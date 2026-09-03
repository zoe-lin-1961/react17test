import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router";
import OpenSeadragon from 'openseadragon';
import { SeatMapOSD } from '../components/SeatMapOSD';
import { BUNDLE } from '../components/seatConfig';

// import { BUNDLE, TPL_VER } from '../components/seatConfig';

function Pics() {
    let navigate = useNavigate();
    // 1. 建立一個 ref 用來綁定 DOM 元素
    const viewerRef = useRef(null);
    // 2. 建立一個 ref 用來儲存 OpenSeadragon 實例，避免重複初始化
    const osdInstance = useRef(null);
    const [picUrl, setPicUrl] = useState(Object.entries(BUNDLE.scenes)[0][1].dzi);
    const [mapData, setMapData] = useState(Object.entries(BUNDLE.scenes)[0]);
    const [selectedKey, setSelectedKey] = useState(Object.entries(BUNDLE.scenes)[0][0]); // 新增：追蹤選中的按鈕
    const baseData = Object.entries(BUNDLE.scenes)[0];
    let sources = 'https://seat-lookup.qori.workers.dev/'+picUrl;

    useEffect(() => {
        // 3. 確保 DOM 已渲染且尚未初始化過
        if (viewerRef.current && !osdInstance.current) {
            osdInstance.current = OpenSeadragon({
                element: viewerRef.current, // 綁定容器
                prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/', // 按鈕圖示來源
                tileSources: sources,
                showNavigator: true, // 可選：顯示導航小地圖
            });
        }

        // 4. 組件卸載（銷毀）時，清除 OpenSeadragon 實例防止記憶體洩漏
        return () => {
            if (osdInstance.current) {
                osdInstance.current.destroy();
                osdInstance.current = null;
            }
        };
    });

    const handleItemClick = (item) => {
        if (!item || !item[1]) return; // 安全檢查，防呆機制
        
        setPicUrl(item[1].dzi);
        setMapData(item);
        setSelectedKey(item[0]); // 更新選中的按鈕 key       
    };

    return (
        <div className="page !p-0 !pt-4 bg-white">
            <button className="absolute z-10 right-1 w-30 px-3 py-2 text-xs font-medium text-white truncate
                            bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2
                            focus:ring-indigo-500 focus:ring-offset-1 active:scale-95 transition-all duration-150"
                            onClick={()=>navigate('/')}
                            >
                                回上頁
            </button>
            
            <div className="w-90 p-4 m-4 mt-0 bg-white border border-gray-100 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                {/* 卡片標題（可選） */}
                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    切換場景
                </h3>
                
                {/* 網格容器：設定為 grid 佈局，按鈕會自動填滿並保持等寬高 */}
                {/* 提示：您可以根據按鈕數量修改 grid-cols-3（三欄）或 grid-cols-2（兩欄） */}
                <div className="grid grid-cols-3 gap-2">
                    {Object.entries(BUNDLE.scenes).map((item) => {
                        const isSelected = selectedKey === item[0];
                        return (
                            <button 
                                className={`w-full px-3 py-2 text-xs font-medium truncate
                                    rounded-md shadow-sm focus:outline-none focus:ring-2
                                    focus:ring-indigo-500 focus:ring-offset-1 active:scale-95 
                                    transition-all duration-150
                                    ${isSelected 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                                    }`}
                                key={item[0]} 
                                onClick={() => handleItemClick(item)}
                                title={item[1].name}
                            >
                                {item[1].name}
                            </button>
                        );
                    })}
                </div>
            </div>
            {/* <div 
                ref={viewerRef} 
                style={{ width: '100%', aspectRatio: '1', backgroundColor: '#333' }} 
            /> */}
            <div style={{ width: '100%',aspectRatio: '1', backgroundColor: '#333' }}>
                <SeatMapOSD data={mapData} baseData={baseData} />
            </div>
        </div>
    );
}

export default Pics;