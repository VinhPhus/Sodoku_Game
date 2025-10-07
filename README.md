# Sodoku_Game

##  1.Giới thiệu chung

##  2.Mục tiêu đề tài

##  3.Công nghệ và môi trường
3.1. Ngôn ngữ lập trình chính

Python 3.10+: Dùng cho phần Server – chịu trách nhiệm xử lý logic trò chơi, quản lý người chơi, tạo phòng đấu, kiểm tra kết quả và lưu lịch sử vào cơ sở dữ liệu.

JavaScript (ES6+): Dùng cho phần Client (Frontend) – hiển thị giao diện web Sudoku, gửi/nhận dữ liệu với Server, hiển thị thời gian và kết quả.

HTML5, CSS3: Dùng xây dựng bố cục và giao diện người chơi trực quan, thân thiện.
3.2. Kiến trúc hệ thống

Hệ thống được thiết kế theo mô hình Client–Server:

Server (Python FastAPI):

Lắng nghe nhiều kết nối client thông qua WebSocket.

Quản lý danh sách người chơi online.

Xử lý logic thách đấu, gửi bảng Sudoku, nhận và kiểm tra nước đi.

Lưu kết quả và lịch sử trận đấu vào cơ sở dữ liệu (SQLite hoặc PostgreSQL).

Client (React/HTML/JS):

Kết nối tới Server qua WebSocket.

Hiển thị giao diện Sudoku, đồng hồ đếm thời gian, kết quả, và thông báo.

Gửi các yêu cầu (thách đấu, hoàn thành, nhập số) lên server.
3.3. Công nghệ và thư viện sử dụng
a. Phần Server (Backend)

FastAPI: Framework Python hiện đại, hiệu năng cao, hỗ trợ WebSocket giúp xử lý giao tiếp thời gian thực giữa nhiều client.

Uvicorn: Web server chạy FastAPI ở chế độ bất đồng bộ (asynchronous).

SQLAlchemy: ORM quản lý truy cập cơ sở dữ liệu dễ dàng.

SQLite: Cơ sở dữ liệu nhẹ, phù hợp môi trường phát triển và demo.

WebSocket (websockets hoặc fastapi[websockets]): Dùng để trao đổi dữ liệu liên tục giữa client và server mà không cần tải lại trang.

Pydantic: Quản lý và kiểm tra dữ liệu vào/ra (request/response).

Logging module: Lưu nhật ký hệ thống, phục vụ theo dõi và gỡ lỗi.

b. Phần Client (Frontend)

ReactJS: Thư viện xây dựng giao diện web hiện đại, hỗ trợ component hóa bảng Sudoku và đồng bộ dữ liệu real-time.

Axios hoặc Fetch API: Gửi các request REST (đăng nhập, lấy lịch sử trận đấu).

WebSocket API (native): Dùng để giao tiếp trực tiếp với Server khi chơi thách đấu.

Tailwind CSS / Bootstrap: Tạo giao diện Sudoku thân thiện, responsive và đẹp mắt.

LocalStorage / State Management (React useState, Context): Lưu tạm thông tin người chơi, thời gian, trạng thái bảng Sudoku.
3.4. Môi trường phát triển

Hệ điều hành: Windows 10/11, macOS hoặc Ubuntu 20.04+.

Trình soạn thảo mã nguồn: Visual Studio Code hoặc PyCharm.

Công cụ quản lý gói:

pip và virtualenv cho Python.

npm hoặc yarn cho React.

Công cụ kiểm thử API: Postman hoặc Thunder Client (VSCode).

Công cụ quản lý mã nguồn: Git và GitHub.

Trình duyệt hỗ trợ: Google Chrome, Microsoft Edge, Firefox.
3.5. Môi trường triển khai

Server có thể triển khai trên:

Render / Railway / Vercel / PythonAnywhere cho môi trường cloud miễn phí.

Docker container để đảm bảo tính nhất quán khi triển khai thực tế.

Client (React) có thể build và triển khai tĩnh trên:

Vercel, Netlify, hoặc GitHub Pages.

Database (SQLite) được đặt cùng server hoặc chuyển sang PostgreSQL khi triển khai thật.
3.6. Lý do chọn công nghệ

Python (FastAPI): Cung cấp hiệu năng cao, dễ lập trình và tích hợp WebSocket – phù hợp xử lý nhiều kết nối cùng lúc.

ReactJS: Dễ dàng tạo giao diện động, cập nhật thời gian thực khi người chơi nhập số.

WebSocket: Giúp truyền dữ liệu nhanh và liên tục giữa 2 người chơi mà không cần reload.

SQLite / PostgreSQL: Giúp lưu lịch sử trận đấu và dễ mở rộng trong tương lai.

Kiến trúc Client–Server: Giúp mở rộng lên hệ thống đa phòng, thêm chat hoặc bảng xếp hạng dễ dàng sau này.

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
