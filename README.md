# Sodoku_Game

##  1.Giới thiệu chung

##  2.Mục tiêu đề tài

##  3.Công nghệ và môi trường

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
