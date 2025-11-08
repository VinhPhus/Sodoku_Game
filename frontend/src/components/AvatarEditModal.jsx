import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import "../style/AvatarEditModal.css";

/**
 * Modal để chỉnh sửa ảnh đại diện.
 * @param {boolean} isOpen - Trạng thái modal có đang mở hay không.
 * @param {function} onClose - Hàm để đóng modal.
 * @param {function} onSave - Hàm để lưu ảnh mới (truyền về URL đối tượng).
 * @param {string} currentAvatar - URL ảnh đại diện hiện tại để hiển thị.
 */
const AvatarEditModal = ({ isOpen, onClose, onSave, currentAvatar }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Tạo URL xem trước khi file được chọn
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Dọn dẹp URL đối tượng khi component unmount hoặc file thay đổi
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Xử lý lưu
  const handleSave = () => {
    if (preview) {
      onSave(preview); // Gửi URL xem trước về App.jsx
    }
    onClose(); // Đóng modal sau khi lưu
  };

  // Xử lý đóng
  const handleClose = () => {
    setSelectedFile(null); // Reset file
    setPreview(null); // Reset preview
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="avatar-modal-overlay" onClick={handleClose}>
      <div
        className="avatar-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-button" onClick={handleClose}>
          <X size={24} />
        </button>
        <h2>Thay đổi ảnh đại diện</h2>

        <div className="avatar-preview-container">
          <img
            src={preview || currentAvatar}
            alt="Xem trước"
            className="avatar-preview"
          />
        </div>

        <label htmlFor="file-upload" className="file-upload-label">
          <Upload size={18} />
          {selectedFile ? selectedFile.name : "Chọn ảnh mới"}
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        <div className="modal-actions">
          <button className="modal-button-cancel" onClick={handleClose}>
            Hủy
          </button>
          <button
            className="modal-button-save"
            onClick={handleSave}
            disabled={!preview}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditModal;
