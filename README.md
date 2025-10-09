<img width="467" height="491" alt="image" src="https://github.com/user-attachments/assets/a64e60e6-a8fe-4e56-ab9d-7835c055e21f" /># Sodoku_Game

##  1.Giới thiệu chung
Sudoku là trò chơi logic sắp xếp chữ số, ra đời tại Mỹ vào thập niên 1970 với tên gọi “Number Place” do Howard Gans sáng tạo.Trò chơi yêu cầu người chơi điền các con số từ 1 đến 9 vào một bảng 9x9 sao cho mỗi hàng, mỗi cột và mỗi khối 3x3 đều chứa đủ các số từ 1 đến 9 mà không bị trùng lặp.
 Dự án “Lập trình game cờ Sodoku” được xây dựng nhằm mô phỏng trò chơi Sudoku dưới dạng một ứng dụng mạng. Thông qua mô hình Client–Server, hai người chơi (client) có thể kết nối tới cùng một server để thách đấu với nhau trong thời gian thực. Mỗi trận đấu có cơ chế tính thời gian suy nghĩ, giúp tăng tính cạnh tranh và rèn luyện khả năng tư duy logic của người chơi.


##  2.Mục tiêu đề tài
Mục tiêu đề tài
Đề tài hướng đến việc nghiên cứu và phát triển ứng dụng trò chơi Sudoku theo mô hình Client–Server, nhằm hiện thực hóa khả năng tương tác trực tuyến giữa hai người chơi.
Mục tiêu là xây dựng hệ thống có khả năng kết nối ổn định, hỗ trợ gửi và nhận yêu cầu thách đấu, theo dõi thời gian suy nghĩ của từng người chơi, đồng thời lưu trữ kết quả và lịch sử trận đấu để phục vụ mục đích thống kê và cải thiện trải nghiệm người dùng.

Xây dựng hệ thống Client–Server:
Cho phép nhiều client kết nối đồng thời đến server.


Quản lý và điều phối các yêu cầu thách đấu giữa các người chơi.
Phát triển cơ chế thách đấu:
Người chơi có thể gửi và nhận lời mời thách đấu.


Server tạo và phân phối bảng Sudoku cho cả hai người chơi.
Theo dõi và lưu trữ lịch sử trận đấu:
Ghi lại kết quả, thời gian, và thông tin người chơi cho từng trận.
Tính thời gian suy nghĩ của từng người chơi:
Đếm thời gian mỗi người trong quá trình giải để làm căn cứ xác định người chiến thắng khi cần.
Tăng tính tương tác và học hỏi:
Giúp người chơi vừa rèn luyện tư duy logic, vừa có môi trường thi đấu trực tiếp với người khác.


##  3.Công nghệ và môi trường
### 3.1. Ngôn ngữ lập trình chính

Python 3.10+ – Dùng cho phần Server, chịu trách nhiệm:

Xử lý logic trò chơi.

Quản lý người chơi, tạo phòng đấu, kiểm tra kết quả.

Lưu lịch sử trận đấu vào cơ sở dữ liệu.

JavaScript (ES6+) – Dùng cho phần Client (Frontend):

Hiển thị giao diện Sudoku.

Gửi/nhận dữ liệu với Server, hiển thị thời gian và kết quả.

HTML5, CSS3 – Dùng để xây dựng bố cục và giao diện người chơi trực quan, thân thiện.

### 3.2. Kiến trúc hệ thống

Hệ thống được thiết kế theo mô hình Client–Server:

🖥️ Server (Python FastAPI)

Lắng nghe nhiều kết nối client thông qua WebSocket.

Quản lý danh sách người chơi online.

Xử lý logic thách đấu, gửi bảng Sudoku, nhận và kiểm tra nước đi.

Lưu kết quả và lịch sử trận đấu vào SQLite hoặc PostgreSQL.

💻 Client (React / HTML / JS)

Kết nối tới server qua WebSocket.

Hiển thị giao diện Sudoku, đồng hồ đếm thời gian, kết quả, và thông báo.

Gửi các yêu cầu như thách đấu, hoàn thành, nhập số lên server.

### 3.3. Công nghệ và thư viện sử dụng
⚙️ Phần Server (Backend)

FastAPI – Framework Python hiện đại, hiệu năng cao, hỗ trợ WebSocket.

Uvicorn – Web server chạy FastAPI ở chế độ bất đồng bộ.

SQLAlchemy – ORM quản lý truy cập cơ sở dữ liệu.

SQLite – Cơ sở dữ liệu nhẹ, dễ triển khai.

WebSocket (websockets hoặc fastapi[websockets]) – Giao tiếp liên tục giữa client và server.

Pydantic – Kiểm tra dữ liệu vào/ra (request/response).

Logging – Lưu nhật ký hoạt động, hỗ trợ debug.

🎨 Phần Client (Frontend)

ReactJS – Xây dựng giao diện động, component hóa bảng Sudoku.

Axios / Fetch API – Gửi request REST (đăng nhập, lấy lịch sử).

WebSocket API – Giao tiếp trực tiếp khi chơi thách đấu.

Tailwind CSS / Bootstrap – Giao diện đẹp, responsive.

LocalStorage / React State – Lưu thông tin người chơi và thời gian tạm thời.

### 3.4. Môi trường phát triển

Hệ điều hành: Windows 10/11, macOS hoặc Ubuntu 20.04+.

IDE / Editor: Visual Studio Code, PyCharm.

Công cụ quản lý gói:

pip, virtualenv cho Python.

npm, yarn cho React.

Công cụ kiểm thử API: Postman, Thunder Client (VSCode).

Quản lý mã nguồn: Git, GitHub.

Trình duyệt hỗ trợ: Chrome, Edge, Firefox.

### 3.5. Môi trường triển khai
🖥️ Server

Triển khai trên Render, Railway, Vercel, hoặc PythonAnywhere.

Có thể đóng gói bằng Docker để đảm bảo tính nhất quán khi triển khai.

🌐 Client

Build và triển khai tĩnh trên Vercel, Netlify, hoặc GitHub Pages.

🗄️ Cơ sở dữ liệu

SQLite dùng trong giai đoạn phát triển.

PostgreSQL dùng cho triển khai thực tế.

### 3.6. Lý do chọn công nghệ

Python (FastAPI): Hiệu năng cao, dễ tích hợp WebSocket, phù hợp xử lý nhiều kết nối.

ReactJS: Dễ tạo giao diện động, cập nhật real-time khi người chơi thao tác.

WebSocket: Giúp truyền dữ liệu nhanh và liên tục giữa hai người chơi.

SQLite / PostgreSQL: Lưu lịch sử trận đấu và dễ mở rộng.

Kiến trúc Client–Server: Dễ mở rộng lên hệ thống nhiều phòng, chat hoặc bảng xếp hạng trong tương lai.

##  4.Yêu cầu hệ thống

### 4.1. **Yêu cầu chức năng**

1. **Kết nối mạng (Client–Server)**
   - Client có thể kết nối tới Server thông qua địa chỉ IP và cổng (port) cố định.
   - Server có khả năng lắng nghe nhiều kết nối cùng lúc từ nhiều client.

2. **Đăng nhập / Xác định người chơi**
   - Mỗi client khi vào game cần nhập tên người chơi (username).
   - Server lưu trữ danh sách người chơi đang online.

3. **Chức năng thách đấu**
   - Một client có thể gửi yêu cầu thách đấu đến một client khác đang online.
   - Người được thách đấu có thể **chấp nhận** hoặc **từ chối** lời mời.
   - Khi cả hai đồng ý, Server tạo **phòng đấu** và gửi cùng một bảng Sudoku cho cả hai.

4. **Gameplay (Chơi Sudoku)**
   - Cả hai người chơi nhận được cùng một bảng Sudoku ngẫu nhiên.
   - Mỗi người chơi điền số vào các ô và gửi dữ liệu lên Server.
   - Server kiểm tra tính hợp lệ của từng nước đi (nếu có xử lý trung tâm).
   - Hệ thống hiển thị **thời gian suy nghĩ** của mỗi người chơi.

5. **Kết thúc trận đấu**
   - Người chơi có thể bấm “Hoàn thành”.
   - Server kiểm tra kết quả Sudoku đúng/sai.
   - Server xác định người thắng (đúng và nhanh hơn).
   - Server gửi kết quả cho cả hai client.

6. **Lưu lịch sử trận đấu**
   - Server lưu thông tin mỗi trận: người chơi, thời gian, kết quả, ngày giờ.
   - Có thể mở rộng thêm tính năng xem lại lịch sử.

---
###  4.2.**Yêu cầu phi chức năng**
1. **Hiệu năng**
   - Thời gian phản hồi giữa Client–Server dưới 1 giây.
   - Server có thể xử lý ít nhất 5–10 client cùng lúc.

2. **Bảo mật**
   - Dữ liệu truyền giữa client và server được mã hóa đơn giản (ví dụ: base64 hoặc định dạng JSON có token xác thực).
   - Mỗi client chỉ có thể thao tác trong phòng của mình.

3. **Tính ổn định**
   - Server không bị crash khi có client ngắt kết nối bất ngờ.
   - Khi mất kết nối, client có thể kết nối lại mà không ảnh hưởng hệ thống.

4. **Khả năng mở rộng**
   - Có thể dễ dàng nâng cấp thành hệ thống nhiều phòng chơi (multi-room).
   - Cho phép thêm chức năng chat, bảng xếp hạng trong tương lai.

5. **Tính thân thiện người dùng**
   - Giao diện Sudoku hiển thị rõ ràng, dễ thao tác.
   - Có đồng hồ đếm thời gian và thông báo kết quả trực quan.

---

##  5.Kiến trúc hệ thống
### 5.1 Tổng quan kiến trúc

  Hệ thống theo mô hình Client – Server real-time bằng WebSocket.
  
  🖥️ Client (React / HTML / JS)
  
  Kết nối WebSocket tới Server.
  
  Hiển thị board Sudoku, đồng hồ, gửi request (challenge, move, complete).
  
  Gọi REST API cho login / history.
  
  ⚙️ Server (FastAPI + Uvicorn, asyncio)
  
  WebSocket Gateway: nhận/đẩy message real-time.
  
  Matchmaker / Room Manager: ghép cặp, tạo phòng.
  
  Game Engine: sinh & kiểm tra Sudoku, quản lý lượt, tính điểm.
  
  Session / Timer Manager: quản lý thời gian mỗi lượt và tổng thời gian.
  
  Persistence Layer: lưu lịch sử (SQLite cho dev, PostgreSQL cho production).
  
  Cache / Broker (Redis): dùng khi scale (pub/sub, shared state, session store).
  
  ☁️ Infrastructure
  
  Load balancer / Reverse proxy: Nginx.
  
  Containers: Docker; K8s / PaaS (Render, Railway) khi cần.
  
  Observability: logging, metrics, alerting.

### 5.2 Các module chính & trách nhiệm
  #### 1. WebSocket Gateway
  
  Endpoint WS (vd: /ws?token=...) xác thực JWT trước khi kết nối.
  
  Mỗi kết nối ánh xạ tới PlayerSession (in-memory hoặc Redis).
  
  Chuyển message JSON tới Room Manager.
  
  #### 2. Authentication / API
  
  REST endpoints: /login, /history, /profile.
  
  WebSocket auth: truyền token trong query hoặc message đầu; server xác thực quyền.
  
  #### 3. Matchmaker / Room Manager
  
  Tạo room khi 2 người chơi chấp nhận thách đấu.
  
  Gán match_id, sinh MatchState chứa board, turn, timers, players.
  
  Dùng asyncio.Lock để serialize xử lý move.
  
 #### 4. Game Engine
  
  Sinh board (theo độ khó), gửi bản giống nhau cho cả 2 client.
  
  Kiểm tra hợp lệ của move (row, col, subgrid).
  
  Cập nhật state, tính think_ms, broadcast kết quả.
  
  Khi hoàn tất: so sánh thời gian → declare winner.
  
  #### 5. Timer Manager
  
  Mỗi trận có:
  
  per_move_timeout (vd: 60s)
  
  total_thinking_time/player
  
  Timer chạy server-side, gửi timer_update định kỳ.
  
  Nếu timeout → xử thua hoặc bỏ lượt.
  
  #### 6. Persistence Layer
  
  ORM: SQLAlchemy (User, Match, Move).
  
  Lưu moves, timestamps, think_ms, winner, start/end time.
  
  #### 7. Redis (khi scale)
  
  Pub/Sub: broadcast event giữa nhiều instance.
  
  Shared state: match metadata ngắn hạn.
  
  Session store: hỗ trợ reconnect.

  ### 5.3 Luồng thông điệp chính
 #### 🔸 A. Tạo trận (Challenge Flow)
1. Client A → Server:
{ "type": "challenge_request", "from": "A", "to": "B" }

2. Server → B
3. B → Server:
{ "type": "challenge_response", "accept": true }

4. Server tạo match_id, sinh board:
{ 
  "type": "game_start", 
  "match_id": "uuid", 
  "board": "base64/JSON", 
  "turn": "A", 
  "per_move_ms": 60000 
}

#### 🔸 B. Đi nước & đồng bộ (Move Flow)
1. Player → Server:
{ "type": "move", "match_id": "uuid", "player": "A", "r": 0, "c": 1, "v": 5 }

2. Server:
- Kiểm tra lượt hợp lệ.
- Validate move bằng Game Engine.
- Cập nhật board, lưu move.
- Broadcast move_result + next_turn.

#### 🔸 C. Hoàn thành / Kết thúc

Player nhấn complete.

Server validate toàn bộ board.

Nếu hợp lệ → declare winner, lưu kết quả, gửi game_end.

### 5.4 Cơ chế đồng bộ & xử lý race conditions

Dùng per-match asyncio.Lock để tránh race.

Server là nguồn chân lý (authoritative).

Mỗi move có client_move_id để tránh duplicate.

Strict turn-based → chỉ 1 move hợp lệ được chấp nhận.

async with match.lock:
    if player != match.current_turn:
        return invalid("not your turn")
    valid = game_engine.validate_move(...)
    if valid:
        match.apply_move(...)
        await broadcast(...)

### 5.5 Thiết kế Timer

Server-side timer cho mỗi match/player.

#### Khi bắt đầu lượt:

Tạo task asyncio.create_task đếm ngược per_move_timeout.

Gửi timer_update mỗi 1s hoặc khi thay đổi.

#### Khi player gửi move:

Hủy timer task, tính think_ms, cộng vào total_think_ms.

#### Khi timeout → broadcast timeout event.

### 5.6 Mô hình dữ liệu
Table	Columns
users	id (UUID), username, created_at
matches	id, player_a_id, player_b_id, start_time, end_time, winner_id, initial_board (JSON), result (enum)
moves	id, match_id, player_id, row, col, value, server_ts, think_ms, client_move_id
match_players (optional)	match_id, player_id, total_think_ms, final_status (left/forfeit/finished)

Indexes:

matches(start_time)

moves(match_id, server_ts)

### 5.7 Kết nối, reconnect và xử lý disconnect

Khi client disconnect → session offline.

Giữ MatchState trong memory + Redis.

Cho phép reconnect trong RECONNECT_WINDOW (60s).

Nếu reconnect thành công → resume session & timer.

Nếu quá hạn → xử thua.

Redis lưu match metadata (players, turn, timers) để resume trên instance khác.

### 5.8 Bảo mật & tính toàn vẹn

WebSocket qua WSS (TLS).

Xác thực bằng JWT (WS) và HTTPS (REST).

Validate mọi input bằng Pydantic.

Không tin client – server kiểm tra toàn bộ luật Sudoku.

Rate limit WS & REST.

Hash password (bcrypt).

### 5.9 Scalability & triển khai
Dev

Single Uvicorn worker

SQLite

Prod

Multi workers/containers + Nginx LB

Redis cho pub/sub + shared session

PostgreSQL cho lưu trữ

Không cần sticky session nếu có Redis

Docker + CI/CD, Alembic cho migration

### 5.10 Test, Logging & Observability
🧪 Tests

Unit: Game Engine, timer logic.

Integration: WS flows (challenge, move, timeout) – pytest-asyncio.

🧾 Logging

Structured logs (JSON): match start/end, errors.

📊 Metrics & Alerting

Metrics: matches/sec, message latency, active connections → Prometheus + Grafana.

Alert: crash worker, Redis queue length, DB errors.

### 5.11 Kết luận

Server là authoritative source về board, turn, timer.

Dùng per-match lock để đảm bảo nhất quán.

Lưu lịch sử đầy đủ (moves + think_ms).

Thiết kế bắt đầu đơn giản (in-memory + SQLite) nhưng sẵn sàng scale với Redis + Postgres.

##  6.Sơ đồ 

<img width="467" height="491" alt="image" src="https://github.com/user-attachments/assets/db4a9535-d9e9-4226-9812-836426ec5776" />
sơ đồ hệ thống sudoku

**Mô tả sơ đồ**

**1.	Client (React/JS UI)**

•	Mỗi người chơi có giao diện Sudoku 9x9.

•	Kết nối WebSocket tới userver để gửi/nhận move, thách đấu, kết quả.

•	Dùng REST API để đăng nhập và lấy lịch sử trận đấu.

•	Có timer hiển thị thời gian suy nghĩ.

**2.	WebSocket Gateway (FastAPI)**

•	Trung gian nhận/gửi message real-time từ các client.

•	Xác thực JWT khi client kết nối.

**3.	Các module server**

•	Auth / REST: xử lý đăng nhập (/login), lịch sử trận (/history).

•	Matchmaker / Room Manager: quản lý danh sách người chơi, ghép cặp, tạo phòng đấu.

•	Game Engine: sinh bảng Sudoku, kiểm tra hợp lệ nước đi, broadcast kết quả.

•	Timer Manager: tính thời gian cho từng người chơi, phát sự kiện timeout.

**4.	Persistence Layer (DB + ORM)**

•	Lưu toàn bộ thông tin: users, moves, matches, kết quả, thời gian suy nghĩ.

•	SQLite cho giai đoạn phát triển, PostgreSQL cho triển khai thật.

•	Redis hỗ trợ khi hệ thống scale (pub/sub, lưu state, reconnect).

**5.	Luồng chính**

•	Đăng nhập: Client → REST /login → Server xác thực → trả JWT.

•	Thách đấu: Client A gửi challenge → Server → chuyển cho Client B → B chấp nhận → tạo phòng → gửi board Sudoku giống nhau cho cả hai.

•	Chơi game: Người chơi nhập số → gửi move qua WS → Server validate → cập nhật state → broadcast lại. Timer luôn chạy server-side.

•	Kết thúc: Người chơi bấm “Hoàn thành” → Server check → xác định thắng/thua → lưu DB → gửi game_end.

**Điểm nổi bật**

•	Server là nguồn chân lý (authoritative): chỉ server mới quyết định move hợp lệ và kết quả.

•	Timer server-side: tránh gian lận, đảm bảo công bằng.

•	Persistence đầy đủ: lưu tất cả moves + thời gian để có thể thống kê hoặc replay.

•	Khả năng mở rộng: dễ nâng cấp lên multi-room, chat, leaderboard.


