# Week8：用 Node.js 寄一封信給自己

使用者報名成功，網站總要寄一封通知吧？這週先把程式寄信接通。

這個範例只用本機 Node.js 和東京 SES。先取得 MessageId，再去信箱找同一封信。

## 先完成 AWS 設定

- 在東京 `ap-northeast-1` 驗證自己能收信的 Email identity，狀態要是 **Verified**。
- 建立本週專用 IAM User `livefit-w8-ses-sender`，不用 Console access。
- 使用 `iam-policy.json` 範本：把 `REPLACE_WITH_IDENTITY_ARN` 換成自己的東京 Email identity ARN，把兩處 `you@example.com` 換成同一個已驗證信箱，政策命名為 `LiveFitW8SendEmail`，只附加給這個 User。
- 為該 User 建立 **Local code** 用途的 Access Key，填入下方 `.env`。SDK 要用 Access Key ID／Secret Access Key，不能填 SMTP 密碼。

範本只允許 `ses:SendEmail`，寄件／收件限定自己的信箱。沒有其他廣泛授權時，程式就只能照這個範圍寄信。

## 開始跑

需要 Node.js 24。先下載範例：

```bash
git clone https://github.com/hexschool/aws-week8-ses.git
cd aws-week8-ses
npm ci
```

**Mac／Linux** 複製環境設定：

```bash
cp .env.example .env
```

**Windows PowerShell**：

```powershell
Copy-Item .env.example .env
```

用編輯器開啟 `.env`，填這五個值：

| 欄位 | 填什麼 |
|---|---|
| `AWS_REGION` | 保留 `ap-northeast-1` |
| `AWS_ACCESS_KEY_ID` | 本週專用 Key 的 ID |
| `AWS_SECRET_ACCESS_KEY` | 同一把 Key 的 Secret |
| `SES_FROM_EMAIL` | 自己已驗證的信箱 |
| `SES_TO_EMAIL` | 和 From 相同的信箱 |

接著執行：

```bash
npm start
```

每跑一次都會真的要求 SES 寄一封信。正常會顯示本次主旨與 MessageId；這個 ID 代表 SES 已接受，接著到信箱搜尋主旨尾碼，確認正文與時間。

```text
SES 已接受寄送請求，請到信箱確認。
主旨： LiveFit W8 寄信測試 <本次尾碼>
MessageId： <SES 回傳的值>
```

只想檢查語法、不寄信：

```bash
npm run check
```

## 為什麼收到信還有黃色警示？

老師實跑時，信進了 Gmail 收件匣，但 Gmail 提醒無法驗證來源。SES 驗證 Email 是確認你能用這個信箱；不代表你能替 `gmail.com` 設定寄信認證。

這次練習記錄收到的位置與警示即可。正式服務使用自己管理的網域，設定 DKIM 與 DMARC 對齊。[AWS：DMARC 認證](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dmarc.html)

## 交件與收尾

依 Week8 主線交三張圖：東京 Email identity **Verified**、`npm start` 的主旨／MessageId、收到同一封信的正文／時間。遮住個人信箱與 Account ID。

保存成果後，到 IAM 停用這次專用 Key，確認是 **Inactive**。確定不用補件再刪除；清掉本機 `.env` 與金鑰 CSV。不要提交憑證，也不用把 Key 交給助教。

## 檔案放什麼？

- `send-email.cjs`：完整可執行的寄信程式。
- `.env.example`：空白設定範本。
- `iam-policy.json`：寄件、收件、Identity 都有限制的政策範本。
- `package-lock.json`：固定這次使用的套件版本。

這次只跑寄信程式，不需要 DB、SSH 或 EC2。

## 卡住先看

| 狀況 | 先查什麼 |
|---|---|
| `Email address is not verified` | From／To 是否是東京已驗證身分 |
| `AccessDenied` | Key 的 User、政策 ARN、From／To 是否對應 |
| `SignatureDoesNotMatch`／`InvalidClientTokenId` | ID／Secret 是否配對、有沒有填成 SMTP 密碼、Key 是否已停用 |
| 找不到環境變數 | `.env` 是否在這個資料夾，檔名是否變成 `.env.txt` |
| 有 MessageId 但沒收到 | 先查垃圾郵件；再查 SES 退信／suppression，不連續重寄 |
| clone 失敗 | 網址是否正確；若是私有 repo，確認是否已取得讀取權限 |

[SES Identity](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html) · [Sandbox 限制](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html) · [IAM 寄信權限](https://docs.aws.amazon.com/ses/latest/dg/control-user-access.html)
