# Sodoku_Game

##  1.Giới thiệu chung

##  2.Mục tiêu đề tài

##  3.Công nghệ và môi trường
# 3.1. Ngôn ngữ lập trình chính

Python 3.10+ – Dùng cho phần Server, chịu trách nhiệm:

Xử lý logic trò chơi.

Quản lý người chơi, tạo phòng đấu, kiểm tra kết quả.

Lưu lịch sử trận đấu vào cơ sở dữ liệu.

JavaScript (ES6+) – Dùng cho phần Client (Frontend):

Hiển thị giao diện Sudoku.

Gửi/nhận dữ liệu với Server, hiển thị thời gian và kết quả.

HTML5, CSS3 – Dùng để xây dựng bố cục và giao diện người chơi trực quan, thân thiện.

# 3.2. Kiến trúc hệ thống

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

# 3.3. Công nghệ và thư viện sử dụng
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

# 3.4. Môi trường phát triển

Hệ điều hành: Windows 10/11, macOS hoặc Ubuntu 20.04+.

IDE / Editor: Visual Studio Code, PyCharm.

Công cụ quản lý gói:

pip, virtualenv cho Python.

npm, yarn cho React.

Công cụ kiểm thử API: Postman, Thunder Client (VSCode).

Quản lý mã nguồn: Git, GitHub.

Trình duyệt hỗ trợ: Chrome, Edge, Firefox.

# 3.5. Môi trường triển khai
🖥️ Server

Triển khai trên Render, Railway, Vercel, hoặc PythonAnywhere.

Có thể đóng gói bằng Docker để đảm bảo tính nhất quán khi triển khai.

🌐 Client

Build và triển khai tĩnh trên Vercel, Netlify, hoặc GitHub Pages.

🗄️ Cơ sở dữ liệu

SQLite dùng trong giai đoạn phát triển.

PostgreSQL dùng cho triển khai thực tế.

# 3.6. Lý do chọn công nghệ

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

##  6.Sơ đồ 
