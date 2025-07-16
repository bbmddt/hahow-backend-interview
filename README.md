# Hahow Backend Interview

Hahow Backend Engineer 徵才小專案 (Ares Liu)

## 主要功能

-   列出所有英雄，並能獲取單一英雄的資料。
-   為通過驗證的請求提供更詳細的英雄屬性 (Profile)。
-   透過自定義的重試機制，處理外部 API 的服務異常。
-   實作快取機制，在資料變動頻率不高的前提下，提升 API 回應速度並降低外部服務負載。
-   包含完整的API測試，確保程式碼的可靠性。

## 如何使用

### 前置需求

-   Node.js v22.13.0（推薦使用 nvm use lts/jod 快速切換）
-   npm v10.9.2

### 安裝與執行

1.  **Clone 專案並安裝依賴套件**
    ```bash
    git clone https://github.com/bbmddt/hahow-backend-interview.git
    cd hahow-backend-interview
    npm install
    ```

2.  **設定環境變數**
    複製 `.env.example` 檔案來建立一個 `.env` 檔案。此檔案包含Hahow API 的 URL。
    ```bash
    cp .env.example .env
    ```

3.  **啟動伺服器 (開發模式)**
    ```bash
    npm run dev
    ```

4.  **執行測試**
    ```bash
    npm test
    ```

## API Endpoint

| 方法  | 路徑              | 需要驗證 | 描述                                       |
| :---- | :---------------- | :------- | :----------------------------------------- |
| `GET` | `/heroes`         | 選擇性   | 列出所有英雄。若通過驗證，則回傳英雄屬性。 |
| `GET` | `/heroes/:heroId` | 選擇性   | 獲取單一英雄。若通過驗證，則回傳英雄屬性。 |

**驗證:**
如題目所述在請求中包含以下(Headers):
-   `Name`: `hahow`
-   `Password`: `rocks`

## 專案架構

使用「分層式架構」，保持模組化且易於維護。

```
/src
├── api/          # 處理所有與外部 API 的通訊
├── __tests__/    # 存放所有 Jest 測試檔案
├── controllers/  # 處理請求(Request)/回應(Response)邏輯
├── middlewares/  # 中間件 (如：認證、錯誤處理)
├── routes/       # 定義 API 路由
├── services/     # 實作核心邏輯與資料聚合
├── types/        # 存放共享的型別定義
└── utils/        # 放置工具函式 (如：AppError, 重試邏輯, logger)
```

## 技術棧

-   **TypeScript**: 靜態型別、可讀性高，我目前熟悉的主要框架皆使用(NestJS、React)。
-   **Express.js**: 簡單且靈活的 Web 框架，適合此專案。
-   **Axios**: 用於發送基於 Promise 的 HTTP 請求至外部 API。
-   **Jest & Supertest**: 使用於撰寫全面的單元與整合測試，強大的Mocking功能與簡潔的語法。
-   **Dotenv**: 用於管理環境變數。
-   **Winston**: 功能豐富、靈活的日誌紀錄工具。
-   **ESLint**: 確保程式碼品質與風格一致性。專案中已設定了常用的規則，以提升程式碼的可讀性與可維護性。

## 註解原則

我的原則是註解「**為什麼 (Why)**」，而非「**做什麼 (What)**」，因為我相信好的程式碼應能自我解釋。註解主要用於以下情境：
-   解釋複雜的商業邏輯或演算法。
-   闡述一個不夠直觀的技術決策。
-   標示臨時解決方案或待辦事項 (`// TODO:`)。

## 困難與解決方案

實作過程中，有發現了一些在與第三方 API 協作時常見的挑戰:

### 1. 外部 API 不穩定

-   **挑戰**: 外部 API 可能會暫時無法連線，或者會回傳 `200 OK` 的成功狀態碼，但回應內容卻是錯誤訊息 (例如 `{"code": 1000, "message": "Backend Error"}`)。這會讓一般的錯誤處理失效。

-   **解決方案**: 我實作了**帶有重試機制的 API 請求**。
    1.  **`withRetry` 工具函式**: 我在 `src/utils/retry.ts` 建立了一個通用的重試工具，能重試任何非同步操作。支援可設定的重試次數和「Exponential backoff」策略，避免對外部服務造成太大壓力。
    2.  **集中 API 請求邏輯**: 在service層 (`src/services/hero.service.ts`) 中，我建立了一個集中的 `callHahowApi` 函式來包裝每一次的外部 API 呼叫。利用 `withRetry` 來自動重試失敗的請求，以及前面提到的`200 OK`但卻回傳錯誤訊息。
    3.  **錯誤日誌**: 如果一個 API 請求多次重試後仍然失敗，系統會記錄一條帶有明確context的錯誤日誌（例如：`Failed to execute Hahow API call [getHeroProfileById for hero 1]`）。提供錯誤追蹤，讓開發能定位問題。

### 2. 驗證失敗 vs. 服務異常

-   **挑戰**: 失敗的驗證（例如密碼錯誤）和驗證API回傳錯誤訊息分為兩種不同的情況。即使驗證失敗，API 也應該能繼續提供公開資料。

-   **解決方案**: 我在 (`src/middlewares/auth.middleware.ts`) 中實作了**降級處理**。
    -   如果外部驗證 API 回傳 `401 Unauthorized` 錯誤，authMiddleware 只會將該請求標記為「未驗證」(`req.isAuthenticated = false`)，然後繼續向下傳遞。這讓使用者仍然可以看到公開的英雄資料。
    -   只有當驗證服務無法使用時且重試無效，系統才會向客戶端回傳 `503 Service Unavailable` 錯誤。

### 3. 如何提升 API 效能與穩定性？

-   **挑戰**: 我假設外部 API 的資料變動頻率不高，重複地請求相同資源會造成不必要的延遲，並增加外部 API 的負載，甚至可能觸發 Rate Limit。

-   **解決方案**: 我導入了 **In-Memory Cache 機制** (`node-cache`) 來暫存外部 API 的回應。
    1.  **快取英雄資料**: 在 `src/services/hero.service.ts` 中，我使用 `node-cache` 將獲取到的英雄列表與個別英雄資料進行快取。
    2.  **降低延遲**: 當下一次有相同的請求時，系統會直接從快取中回傳資料，大幅降低了 API 的回應時間。
    3.  **保護外部服務**: 此機制可以顯著減少對 Hahow API 的請求次數，不僅提升了自身服務的效能，也降低了因超過請求限制而導致服務中斷的風險。

-   **技術決策考量**:
    -   **為何選擇 `node-cache`**: 考量到此專案為單一服務且規模較小，`node-cache` 是一個輕量級、無須額外設定的 In-Memory 快取方案。它能以最低的成本滿足當前的效能優化需求。
    -   **未來擴展至 Redis 的時機**: 當專案發展到以下階段時，我會考慮將快取機制轉換為 Redis：
        -   **水平擴展**: 當專案規模擴大，需要部署到多個Instance上時，需要一個集中式的快取來確保所有Instance間的資料一致性。
        -   **資料持久化**: 如果需要快取的資料在服務重啟後依然存在。
        -   **更大的資料量與進階功能**: 當快取資料量超出單一應用程式記憶體負荷，或需要使用 Redis 提供的進階資料結構（如 Sorted Sets, Hashes）時。
