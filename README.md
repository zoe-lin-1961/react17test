# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment








# React 座位編排系統（react17test）

這是一個使用 React 18 開發的座位編排與場景管理練習專案。系統提供多種預設隊形場景（如圓形、法船、四弘誓願、五大洲等），使用者可即時切換場景並在 Canvas 上查看對應的座位位置圖，同時透過 Redux 管理座位狀態，並將選擇結果自動保存至 localStorage。

## ✨ 功能特色

- 🗺️ **多場景切換**：內建多種隊形模板，可快速切換座位排列方式
  - 基本隊形
  - 圓形
  - 行願千手
  - 靜思家風
  - 法船／法船（異動）
  - 四弘誓願
  - 大船師
  - 教育／慈誠／人文
  - 五大洲（台灣）／五大洲
  - 基本地標＋豆豆圖／基本地標／豆豆圖
- 🎨 **Canvas 位置圖繪製**：使用 Canvas 動態繪製座位分佈，視覺化呈現不同場景
- 💺 **座位狀態管理**：透過 Redux Toolkit 管理座位選擇與切換
- 💾 **自動儲存**：自定義 middleware 將座位狀態寫入 localStorage，重新整理不遺失
- 🔄 **一鍵重置**：快速清除所有座位選擇，恢復初始狀態
- 🧭 **多頁面路由**：使用 React Router v6 管理主頁、圖片、升級、查看等頁面
- 📦 **彈窗管理**：以 Redux slice 控制全域彈窗開關

## 🛠️ 技術棧

- **前端框架**：React 18
- **路由**：React Router v6
- **狀態管理**：Redux Toolkit
- **繪圖**：HTML5 Canvas
- **持久化**：自定義 middleware + localStorage
- **建置工具**：Create React App（或 Vite，請依實際情況調整）

## 🚀 安裝與運行

### 環境要求

- Node.js >= 16
- npm 或 yarn

### 安裝依賴

```bash
npm install

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
