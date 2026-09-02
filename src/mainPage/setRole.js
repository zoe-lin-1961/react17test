import { useState, forwardRef, useImperativeHandle } from 'react';
import { BUNDLE } from '../components/seatConfig';
import { useSelector } from 'react-redux';

function SetRole(props, ref) {

  function Role(){
    const seatList = useSelector((state) => state.seats.list);
    const [seatSit,setSeatSit]=useState('L')
    const [seat1,setSeat1]=useState('')
    const [seat2,setSeat2]=useState('')
    const [ids,setIds]=useState(seatList || [])

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

    function heandleSetSeatSit (e){
      setSeatSit(e.target.value)
    }
    function heandleSetSeat1 (e){
      setSeat1(e.target.value)
    }
    function heandleSetSeat2 (e){
      setSeat2(e.target.value)
    }

    function addRecored(){
      let theSite = {id:seat1+'-'+seat2,side:seatSit}
      const isNotPostion = seat1 > 54 || seat2 > 73 || seat1 < 1 || seat2 < 1 ;
      const hasTheSamePosition = !!ids.find((c)=>c.id===theSite.id && c.side===theSite.side)
      theSite.position =[]
      Object.entries(BUNDLE.scenes).map((item) => {
        const seats = item[1].seats.filter((menber)=>menber.id===theSite.id && menber.side===theSite.side)
        if(seats.length > 0){
          theSite.position.push({scenesName:item[1].name,locationData:seats[0]})
        }else{
          theSite.position.push({scenesName:item[1].name,locationData:'--'})
        }
      })
      if(isNotPostion){
        setSeat1('');
        setSeat2('');
        alert("無此身分證編號, 請輸入正確的位置")
      }
      if(hasTheSamePosition) {
        alert("已經加入了,請勿重複")
      }
      if(!isNotPostion && !hasTheSamePosition){
        setIds(prevIds => [...prevIds, theSite]);
        setSeat1('');
        setSeat2('');
      }
    }

    function removeRecored(_item){
      setIds(prevIds => prevIds.filter(item => !(item.id === _item.id && item.side === _item.side)));
    }

    return (
      <>
        <div>{ids.length > 0? (
          ids.map((item)=>(
              <div className="flex items-center gap-2 mb-2" key={item.id+item.side}>
              <span className='w-15 px-3 py-1.5  rounded-md shadow-sm
            bg-white text-sm '>{item.side==='L'?'西班':'東班'}</span>  
            <span className='w-15 px-3 py-1.5  rounded-md shadow-sm
            bg-white text-sm '>{item.id}</span>  
            <br/>
            <button className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
             text-white text-xs font-medium rounded-full shadow-sm transition duration-150 ease-in-out"
             onClick={()=>removeRecored(item)}
            >
            刪除
            </button>
          </div>
            ))
          ):(
            <></>
          )}
            <div className="flex items-center gap-2">
            <select className="w-15 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm
            bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:border-blue-500 text-sm transition cursor-pointer"
              onChange={heandleSetSeatSit}
              >
              <option value="L">西班</option>
              <option value="R">東班</option>
            </select>
            <input 
              type="number" 
              min="1" 
              max="54" 
              placeholder="排"
              value={seat1}
              onChange={heandleSetSeat1}
              className="w-15 px-1 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center"
            />
            
            <span className="text-gray-500 font-medium">-</span>
            <input 
              type="number" 
              min="1" 
              max="73" 
              placeholder="列"
              onChange={heandleSetSeat2}
              value={seat2}
              className="w-15 px-1 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center"
            />
            <br/>
            <button className="flex items-center justify-center w-8 h-8 bg-blue-600
            hover:bg-blue-700 active:bg-blue-800 text-white text-xs 
            font-medium rounded-full shadow-sm transition duration-150 ease-in-out"
            onClick={addRecored}
            >
            新增
            </button>
          </div>
          </div>

      </>
    )
  }

  return (
    <>
      <Role />
    </>
  );
}

// 使用 forwardRef 導出
export default forwardRef(SetRole);