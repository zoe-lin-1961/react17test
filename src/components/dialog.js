import React,{ Component } from "react";
// import ReactDOM from 'react-dom/client';


export class Dialog extends Component {
    constructor(props){
        super(props);
        this.modal = React.createRef();     
        this.backdrop = React.createRef();
        this.panel = React.createRef();          
    }
    componentDidUpdate(prevProps){
        if(prevProps.isOpen !==this.props.isOpen){
            if(!!this.props.isOpen){
                this.modal.current.classList.remove('hidden');
                requestAnimationFrame(() => {
                    this.backdrop.current.classList.remove('opacity-0');
                    this.panel.current.classList.remove('opacity-0', 'scale-95');
                    this.panel.current.classList.add('opacity-100', 'scale-100');
                })
            }else{
                // 關閉了
                this.backdrop.current.classList.add('opacity-0');
                this.panel.current.classList.remove('opacity-100', 'scale-100');
                this.panel.current.classList.add('opacity-0', 'scale-95');
                if(this.modal.current.classList.value.split('hidden').length === 0){
                    setTimeout(() => {
                        this.modal.current.classList.add('hidden');
                    }, 300);
                } 
            }
        }
    }


    conFirm = ()=>{
        this.props.uploadDialog(false);
        this.props.comfirm(true);
        if(this.props.title==='查詢基本座標'){
            // useNavigate('/pics')
            // this.navigate('/pics')
            this.props.uploadRouter('/pics')
        }

    }


    render(){
        return (
            <div 
            ref={this.modal} 
            className={`fixed ${this.props.isOpen?'':'hidden'} inset-0 z-50 flex items-center justify-center p-4 sm:p-0`}
            role="dialog" 
            aria-modal="true">

            {/*背景遮罩 (Backdrop) */}
            <div 
            ref={this.backdrop}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 opacity-0"></div>

            {/*彈窗主體卡片  */}
            <div 
            ref={this.panel}
            className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-left transform transition-all duration-300 opacity-0 scale-95 z-10">
            
            {/*標頭與關閉按鈕*/}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">
                {this.props.title}
                </h3>
               <button 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition"
                onClick={()=>this.props.uploadDialog(false)}
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>

                </button>
            </div>

            {/*內容區塊*/}
            <div className="mt-4 text-gray-600 leading-relaxed max-h-[60vh] overflow-y-auto">
                {this.props.dialogContent}
            </div>

            {/*底部按鈕區*/}
            <div className="mt-6 flex justify-end gap-3">
                <button 
                onClick={()=>this.props.uploadDialog(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
                取消
                </button>
                <button 
                onClick={this.conFirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm">
                確認
                </button>
            </div>
            </div>
        </div>
        )
    };
    
}