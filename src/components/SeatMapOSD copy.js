import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

export function SeatMapOSD({ data: customData, baseData }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 450 });
  const [displayMode, setDisplayMode] = useState('both'); // 'both', 'base', 'data'
  
  // 縮放和平移狀態
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // 觸控支援
  const [touchStart, setTouchStart] = useState(null);
  const [touchPanStart, setTouchPanStart] = useState(null);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  
  // 用於追蹤是否已完成自動聚焦
  const [hasAutoFocused, setHasAutoFocused] = useState(false);
  
  // 儲存選中座標的畫布位置（用於縮放中心）
  const selectedPosRef = useRef({ x: 0, y: 0 });
  const [selectedSeatId, setSelectedSeatId] = useState(null);

  // 預設資料
  const defaultData = {
    anchor: { cx: 6621.52, cy: 4593.23, r: 643.82 },
    bg: { x0: -10.2847, y0: -7.1343, w: 20.571, h: 14.532 },
    seats: [
      { id: "10-38", side: "L", ix: 5266.1, iy: 4550.9, core: "R", ring: "B" },
      { id: "11-38", side: "L", ix: 5181.3, iy: 4550.9, core: "R", ring: "B" }
    ],
    m_per_unit: 7.6041732283464585
  };
  
  // 要標記為紅色的座位 ID 列表（改為物件陣列）
  const selectData = useSelector((state) => state.seats.list).filter((item)=> !item.hidden) || [];
  // const selectData = [
  //   { id: '9-52', side: 'L', name: '彥君' },
  //   { id: '9-51', side: 'L', name: '佩珊' },
  //   { id: '13-52', side: 'L', name: '秋錦' }
  // ];
  
  // 提取所有選中的 ID 以便快速查找
  const selectedIds = selectData.map(item => item.id);
  
  // 創建 ID 到選中資料的映射
  const selectedMap = {};
  selectData.forEach(item => {
    selectedMap[item.id] = item;
  });
  
  const data = customData?.[1] || defaultData;
  const rawBaseData = baseData?.[1];

  // 將 _baseData 平移和縮放，使其錨點與 data 的錨點對齊，且尺寸相同
  const getAlignedBaseData = () => {
    if (!rawBaseData || !data?.anchor) return null;
    
    const scaleRatio = data.anchor.r / rawBaseData.anchor.r;
    const offsetX = data.anchor.cx - rawBaseData.anchor.cx * scaleRatio;
    const offsetY = data.anchor.cy - rawBaseData.anchor.cy * scaleRatio;
    
    return {
      ...rawBaseData,
      anchor: {
        ...rawBaseData.anchor,
        cx: rawBaseData.anchor.cx * scaleRatio + offsetX,
        cy: rawBaseData.anchor.cy * scaleRatio + offsetY,
        r: rawBaseData.anchor.r * scaleRatio
      },
      seats: rawBaseData.seats.map(seat => ({
        ...seat,
        ix: seat.ix * scaleRatio + offsetX,
        iy: seat.iy * scaleRatio + offsetY
      }))
    };
  };

  const _baseData = getAlignedBaseData();

  // 1. 監聽容器寬度，維持 4:3 比例的響應式大小
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth || 600;
        const height = width * 0.75;
        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 獲取選中座標在畫布上的位置（基於當前縮放和平移）
  const getSelectedCanvasPos = () => {
    if (!data || !data.seats) return null;
    
    // 使用第一個選中的座位
    const firstSelectedId = selectedIds[0];
    if (!firstSelectedId) return null;
    
    const selectedSeat = data.seats.find(seat => seat.id === firstSelectedId);
    if (!selectedSeat) return null;
    
    // 計算所有座標範圍
    let allX = [];
    let allY = [];
    
    if (data) {
      if (data.anchor) {
        allX.push(data.anchor.cx);
        allY.push(data.anchor.cy);
      }
      if (data.seats) {
        data.seats.forEach(s => {
          allX.push(s.ix);
          allY.push(s.iy);
        });
      }
    }
    
    if (displayMode === 'both' && _baseData) {
      if (_baseData.anchor) {
        allX.push(_baseData.anchor.cx);
        allY.push(_baseData.anchor.cy);
      }
      if (_baseData.seats) {
        _baseData.seats.forEach(s => {
          allX.push(s.ix);
          allY.push(s.iy);
        });
      }
    }

    if (allX.length === 0 || allY.length === 0) {
      allX.push(0, 100);
      allY.push(0, 100);
    }

    const dataPadding = 80;
    const minX = Math.min(...allX) - dataPadding;
    const maxX = Math.max(...allX) + dataPadding;
    const minY = Math.min(...allY) - dataPadding;
    const maxY = Math.max(...allY) + dataPadding;

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const width = canvasSize.width;
    const height = canvasSize.height;

    // 計算基礎位置
    let px = ((selectedSeat.ix - minX) / rangeX) * width;
    let py = ((selectedSeat.iy - minY) / rangeY) * height;
    
    // 應用當前縮放和平移
    const centerX = width / 2;
    const centerY = height / 2;
    px = (px - centerX) * zoom + centerX + pan.x;
    py = (py - centerY) * zoom + centerY + pan.y;
    
    return { x: px, y: py };
  };

  // 自動聚焦到選中座位
  useEffect(() => {
    if (hasAutoFocused || !data || !data.seats || data.seats.length === 0) return;
    if (selectedIds.length === 0) return;

    console.log(selectedIds,'selectedIds')

    const firstSelectedId = selectedIds[0];
    const selectedSeat = data.seats.find(seat => seat.id === firstSelectedId);
    if (!selectedSeat) return;

    // 計算所有座標範圍
    let allX = [];
    let allY = [];
    
    if (data) {
      if (data.anchor) {
        allX.push(data.anchor.cx);
        allY.push(data.anchor.cy);
      }
      if (data.seats) {
        data.seats.forEach(s => {
          allX.push(s.ix);
          allY.push(s.iy);
        });
      }
    }
    
    if (displayMode === 'both' && _baseData) {
      if (_baseData.anchor) {
        allX.push(_baseData.anchor.cx);
        allY.push(_baseData.anchor.cy);
      }
      if (_baseData.seats) {
        _baseData.seats.forEach(s => {
          allX.push(s.ix);
          allY.push(s.iy);
        });
      }
    }

    if (allX.length === 0 || allY.length === 0) {
      allX.push(0, 100);
      allY.push(0, 100);
    }

    const dataPadding = 80;
    const minX = Math.min(...allX) - dataPadding;
    const maxX = Math.max(...allX) + dataPadding;
    const minY = Math.min(...allY) - dataPadding;
    const maxY = Math.max(...allY) + dataPadding;

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const width = canvasSize.width;
    const height = canvasSize.height;
    
    const targetX = ((selectedSeat.ix - minX) / rangeX) * width;
    const targetY = ((selectedSeat.iy - minY) / rangeY) * height;

    const centerX = width / 2;
    const centerY = height / 2;
    
    const targetZoom = 2;
    const panX = centerX - targetX * targetZoom - centerX * (1 - targetZoom);
    const panY = centerY - targetY * targetZoom - centerY * (1 - targetZoom);

    setZoom(targetZoom);
    setPan({ x: panX, y: panY });
    setHasAutoFocused(true);
    setSelectedSeatId(firstSelectedId);

  }, [data, _baseData, canvasSize, displayMode, hasAutoFocused, selectedIds]);

  // 重置縮放和平移
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHasAutoFocused(false);
  };

  // 滑鼠滾輪縮放 - 以選中位置為中心
  const handleWheel = (e) => {
    e.preventDefault();
    
    // 獲取選中座標的畫布位置
    const selectedPos = getSelectedCanvasPos();
    if (!selectedPos) {
      // 如果沒有選中座位，使用畫布中心
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const zoomFactor = 1 + delta;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 1000);
      
      // 以畫布中心為縮放中心
      const panX = centerX - (centerX - pan.x) * (newZoom / zoom);
      const panY = centerY - (centerY - pan.y) * (newZoom / zoom);
      
      setZoom(newZoom);
      setPan({ x: panX, y: panY });
      return;
    }

    // 計算縮放因子
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const zoomFactor = 1 + delta;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 1000);
    
    // 以選中位置為縮放中心
    // 公式：newPan = selectedPos - (selectedPos - oldPan) * (newZoom / oldZoom)
    const ratio = newZoom / zoom;
    const newPanX = selectedPos.x - (selectedPos.x - pan.x) * ratio;
    const newPanY = selectedPos.y - (selectedPos.y - pan.y) * ratio;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // 滑鼠事件 - 拖拽平移
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart({ ...pan });
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan({
        x: panStart.x + dx,
        y: panStart.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    }
  };

  // 觸控事件
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 1) {
      const touch = touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchPanStart({ ...pan });
      setIsDragging(true);
    } else if (touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastTouchDistance(distance);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 1 && isDragging && touchStart) {
      const touch = touches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      setPan({
        x: touchPanStart.x + dx,
        y: touchPanStart.y + dy
      });
    } else if (touches.length === 2 && lastTouchDistance !== null) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scaleFactor = distance / lastTouchDistance;
      const newZoom = Math.min(Math.max(zoom * scaleFactor, 0.1), 1000);
      
      // 以選中位置為縮放中心
      const selectedPos = getSelectedCanvasPos();
      if (selectedPos) {
        const ratio = newZoom / zoom;
        const newPanX = selectedPos.x - (selectedPos.x - pan.x) * ratio;
        const newPanY = selectedPos.y - (selectedPos.y - pan.y) * ratio;
        setPan({ x: newPanX, y: newPanY });
      } else {
        // 如果沒有選中座位，以觸控中心為縮放中心
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        // 需要轉換為 canvas 座標
        const rect = canvasRef.current.getBoundingClientRect();
        const canvasCenterX = ((centerX - rect.left) / rect.width) * canvasSize.width;
        const canvasCenterY = ((centerY - rect.top) / rect.height) * canvasSize.height;
        const ratio = newZoom / zoom;
        const newPanX = canvasCenterX - (canvasCenterX - pan.x) * ratio;
        const newPanY = canvasCenterY - (canvasCenterY - pan.y) * ratio;
        setPan({ x: newPanX, y: newPanY });
      }
      
      setZoom(newZoom);
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setTouchStart(null);
    setTouchPanStart(null);
    setLastTouchDistance(null);
  };

  // 2. 繪製圖形邏輯
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 決定要繪製的資料集
    const datasets = [];
    if (displayMode === 'both' || displayMode === 'data') {
      if (data) datasets.push({ data: data, type: 'data', color: '#007bff', label: 'Data' });
    }
    if (displayMode === 'both' || displayMode === 'base') {
      if (_baseData) datasets.push({ data: _baseData, type: 'base', color: '#6c757d', label: 'Base' });
    }

    if (datasets.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('無資料可顯示', width / 2, height / 2);
      return;
    }

    // 收集所有座標點來計算邊界
    let allX = [];
    let allY = [];
    
    if (data) {
      if (data.anchor) {
        allX.push(data.anchor.cx);
        allY.push(data.anchor.cy);
      }
      if (data.seats) {
        data.seats.forEach(s => {
          allX.push(s.ix);
          allY.push(s.iy);
        });
      }
    }
    
    if (displayMode === 'both' && _baseData) {
      if (_baseData.anchor) {
        allX.push(_baseData.anchor.cx);
        allY.push(_baseData.anchor.cy);
      }
      if (_baseData.seats) {
        _baseData.seats.forEach(s => {
          allX.push(s.ix);
          allY.push(s.iy);
        });
      }
    }

    if (displayMode === 'base' && _baseData) {
      allX = [];
      allY = [];
      if (_baseData.anchor) {
        allX.push(_baseData.anchor.cx);
        allY.push(_baseData.anchor.cy);
      }
      if (_baseData.seats) {
        _baseData.seats.forEach(s => {
          allX.push(s.ix);
          allY.push(s.iy);
        });
      }
    }

    if (allX.length === 0 || allY.length === 0) {
      allX.push(0, 100);
      allY.push(0, 100);
    }

    const dataPadding = 80;
    const minX = Math.min(...allX) - dataPadding;
    const maxX = Math.max(...allX) + dataPadding;
    const minY = Math.min(...allY) - dataPadding;
    const maxY = Math.max(...allY) + dataPadding;

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    // 座標轉換
    const toCanvasCoords = (ix, iy) => {
      let px = ((ix - minX) / rangeX) * width;
      let py = ((iy - minY) / rangeY) * height;
      
      const centerX = width / 2;
      const centerY = height / 2;
      px = (px - centerX) * zoom + centerX + pan.x;
      py = (py - centerY) * zoom + centerY + pan.y;
      
      return { x: px, y: py };
    };

    ctx.save();

    // 繪製背景外框
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // 繪製每個資料集
    datasets.forEach(({ data, type, color, label }) => {
      // 繪製 Anchor 範圍圓圈
      if (data.anchor) {
        const anchorCenter = toCanvasCoords(data.anchor.cx, data.anchor.cy);
        const edgePoint = toCanvasCoords(data.anchor.cx + data.anchor.r, data.anchor.cy);
        const radiusPx = Math.abs(edgePoint.x - anchorCenter.x);

        ctx.beginPath();
        ctx.arc(anchorCenter.x, anchorCenter.y, radiusPx, 0, 2 * Math.PI);
        ctx.fillStyle = type === 'base' ? 'rgba(108, 117, 125, 0.15)' : 'rgba(0, 123, 255, 0.08)';
        ctx.fill();
        ctx.strokeStyle = type === 'base' ? 'rgba(108, 117, 125, 0.2)' : 'rgba(0, 123, 255, 0.2)';
        ctx.lineWidth = type === 'base' ? 2.5 : 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(anchorCenter.x, anchorCenter.y, type === 'base' ? 6 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#343a40';
        ctx.textAlign = 'center';
        ctx.fillText('', anchorCenter.x, anchorCenter.y - 10);
      }

      // 繪製 Seats 座位
      if (data.seats) {
        data.seats.forEach(seat => {
          const pos = toCanvasCoords(seat.ix, seat.iy);

          if (pos.x < -50 || pos.x > width + 50 || pos.y < -50 || pos.y > height + 50) {
            return;
          }

          ctx.beginPath();
          let dotSize;
          if (type === 'base') {
            dotSize = 0;
          } else {
            dotSize = Math.min(Math.max(6 * Math.min(zoom, 2), 2), 50);
          }
          
          if (type === 'base') {
            // Base 資料：只顯示 ID 文字
            const fontSize = Math.min(Math.max(8 * Math.min(zoom, 1), 6), 20);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = 'rgba(108, 117, 125, 0.6)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(seat.id, pos.x, pos.y);
          } else {
            // Data 資料：顯示圓形
            ctx.arc(pos.x, pos.y, Math.max(dotSize, 2), 0, 2 * Math.PI);
            
            // 檢查是否在選中列表中
            const isSelected = selectData.some(item => item.id === seat.id && item.side === seat.side);
            
            if (isSelected) {
              ctx.fillStyle = '#ff0000';
              ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
              ctx.shadowBlur = 15;
              ctx.strokeStyle = '#cc0000';
              ctx.lineWidth = 3;
            } else {
              ctx.fillStyle = seat.ring === 'B' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(40, 167, 69, 0.2)';
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;

              // 原來位置的id顯示
              // ctx.fillText(seat.id, pos.x, pos.y);
            }
            
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // 只在被選中時顯示文字（優先顯示 name，否則顯示 id）
            if (isSelected && zoom > 0.8) {
              const selectedInfo = selectedMap[seat.id];
              const displayText = selectedInfo?.name || seat.id;
              
              const idFontSize = Math.min(Math.max(10 * Math.min(zoom, 1.5), 8), 30);
              ctx.font = `bold ${idFontSize}px sans-serif`;
              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(displayText, pos.x, pos.y);
            }

            // 為選中的座位添加額外標記（已註解掉）
            // if (isSelected && zoom > 1.0) {
            //   const starSize = Math.min(Math.max(12 * Math.min(zoom, 2), 12), 50);
            //   ctx.font = `${starSize}px sans-serif`;
            //   ctx.fillStyle = '#ff0000';
            //   ctx.textAlign = 'center';
            //   ctx.textBaseline = 'bottom';
            //   // ctx.fillText('★', pos.x, pos.y - dotSize - 5);
            // }
          }
        });
      }
    });

    // 繪製縮放資訊
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(10, 10, 90, 28, 6) : ctx.rect(10, 10, 90, 28);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const displayZoom = zoom >= 100 ? Math.round(zoom) : 
                        zoom >= 10 ? Math.round(zoom * 10) / 10 : 
                        Math.round(zoom * 100) / 100;
    ctx.fillText(`${displayZoom}×`, 55, 24);

    // 繪製圖例
    const legendY = 20;
    let legendX = 110;
    ctx.textBaseline = 'middle';
    datasets.forEach(({ type, color, label }) => {
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY - 6, 12, 12);
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.font = '12px sans-serif';
      ctx.fillText(label, legendX + 16, legendY + 1);
      legendX += 60;
    });

    if (selectedIds.length > 0 && (displayMode === 'both' || displayMode === 'data')) {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(legendX, legendY - 6, 12, 12);
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.font = '12px sans-serif';
      ctx.fillText(`選中 (${selectedIds.length})`, legendX + 16, legendY + 1);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('🖱 滾輪縮放 · 拖拽平移', width - 10, height - 8);

    ctx.restore();

  }, [canvasSize, data, _baseData, displayMode, zoom, pan, selectedIds, selectedMap]);

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '20px auto' }}>
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        padding: '8px 12px', 
        justifyContent: 'center', 
        flexWrap: 'wrap', 
        background: 'transparent',
      }}>
        <button
          onClick={() => setDisplayMode('both')}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            background: displayMode === 'both' ? '#007bff' : '#e9ecef',
            color: displayMode === 'both' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          基本地標+豆豆圖
        </button>
        <button
          onClick={() => setDisplayMode('base')}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            background: displayMode === 'base' ? '#6c757d' : '#e9ecef',
            color: displayMode === 'base' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          基本地標
        </button>
        <button
          onClick={() => setDisplayMode('data')}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            background: displayMode === 'data' ? '#007bff' : '#e9ecef',
            color: displayMode === 'data' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          豆豆圖
        </button>
        <button
          onClick={resetView}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          🔄 重置
        </button>
      </div>

      <div ref={containerRef} style={{ width: '100%', backgroundColor: '#fff', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            borderRadius: '8px',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {data && data.seats && data.seats.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            padding: '2px 12px',
            borderRadius: '12px',
            fontSize: '10px',
            opacity: 0.5,
            pointerEvents: 'none'
          }}>
            {isDragging ? '拖曳中...' : '🖱 拖曳移動 · 滾輪縮放'}
          </div>
        )}
      </div>
    </div>
  );
}