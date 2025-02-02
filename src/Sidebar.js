import React, { useState } from 'react';
import './Sidebar.css'; // Import CSS for styling
import DragDropArea from './DragDropArea.js';
import { FaEdit, FaTrash, FaHome } from 'react-icons/fa'; // Import edit and delete icons
import Modal from 'react-modal'; // Import react-modal
import { FileImportModal, ConfirmModal, FileRenameModal } from './Modals.js';

Modal.setAppElement('#root'); // Adjust if your root element has a different id

const Sidebar = ({ excelConfig, dataFiles, importFiles, filterList, onImportInit, onImportConfirm, onImportCancel, onDeleteFile, onRenameFile, onFilterChange, onReturnToFrontPage }) => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isReturnModalOpen, setReturnModalOpen] = useState(false);

  const [hoverIndex, setHoverIndex] = useState(-1);

  // DeleteModal handlers
  const openDeleteModal = (index) => {
    setSelectedIndex(index);
    setDeleteModalOpen(true);
  };
  const handleDelete = () => {
    onDeleteFile(selectedIndex);
    closeDeleteModal();
  };
  const closeDeleteModal = () => {
    setSelectedIndex(null);
    setDeleteModalOpen(false);
  };

  // RenameModal handlers
  const openRenameModal = (index) => {
    setSelectedIndex(index);
    setRenameModalOpen(true);
  };
  const handleRename = (newName) => {
    onRenameFile(selectedIndex, newName);
    closeRenameModal();
  };
  const closeRenameModal = () => {
    setSelectedIndex(null);
    setRenameModalOpen(false);
  };

  // importModal handlers
  const handleImportInit = (files) => {
    onImportInit(files);
    setImportModalOpen(true);
  };
  const handleImportConfirm = (alias) => {
    onImportConfirm(alias);
    setImportModalOpen(false);
  };
  const handleImportCancel = () => {
    onImportCancel();
    setImportModalOpen(false);
  };

  // ReturnModal handlers
  const openReturnModal = (index) => {
    if(dataFiles.length > 0)
      setReturnModalOpen(true);
    else
      onReturnToFrontPage();
  };
  const handleReturn = (newName) => {
    onReturnToFrontPage();
    closeRenameModal();
  };
  const closeReturnModal = () => {
    setReturnModalOpen(false);
  };


  // data visibility checkboxes
  const checkboxItems = (excelConfig && excelConfig.yAxisConfig) ? excelConfig.yAxisConfig : [];

  return (
    <div className="sidebar">
     <div className="sidebar-header-container">
        <button className="return-button" onClick={openReturnModal}>
          <FaHome />
        </button>
        <h2 className="sidebar-header">파일 목록 ({dataFiles.length})</h2>
      </div>

      <div className="sidebar-content">
        <ul className="sidebar-list">
          {dataFiles.map((data, index) => (
            <li key={index} className="sidebar-item" onMouseEnter={() => setHoverIndex(index)} onMouseLeave={() => setHoverIndex(-1)}>
              <div className="item-content">
                <div className="item-info">
                  <h4 className="item-title">{data.name}</h4>
                  <p className="item-subtitle">{data.file.name}</p>
                </div>
                <div className="item-actions" style={{display: hoverIndex === index ? 'flex' : 'none'}}>
                  <button className="action-button" onClick={(e) => {e.stopPropagation(); openRenameModal(index);}}>
                    <FaEdit />
                  </button>
                  <button className="action-button delete" onClick={(e) => {e.stopPropagation(); openDeleteModal(index);}}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="dragdrop-area">
        <DragDropArea validExtensions={["xlsx"]} onAddFile={handleImportInit}></DragDropArea>
      </div>

      <div className="checkbox-section">
        <h3>데이터 필터</h3>
        {checkboxItems.map((item, index) => (
          <label key={index}>
            <input
              id={index}
              type="checkbox"
              checked={filterList.includes(index)}
              onChange={(e) => onFilterChange(index, e.currentTarget.checked)}
            />
            {item.name}
          </label>
        ))}
      </div>

      <FileImportModal
        isOpen={isImportModalOpen}
        importFiles={importFiles}
        onImport={handleImportConfirm}
        onCancel={handleImportCancel}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="파일 삭제"
        message={`"${dataFiles[selectedIndex]?.name}" 파일을 삭제하시겠습니까?`}
        confirm_text="삭제하기"
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
      <FileRenameModal
        isOpen={isRenameModalOpen}
        fileName={dataFiles[selectedIndex]?.name}
        onRename={handleRename}
        onCancel={closeRenameModal}
      />
      <ConfirmModal
        isOpen={isReturnModalOpen}
        title="뒤로가기"
        message={
          <>
            홈 페이지로 이동하시겠습니까?
            <br /><br />
            <span style={{ color: 'red' }}>이미 불러온 엑셀파일은 모두 사라집니다.</span>
          </>
        }
        confirm_text="뒤로가기"
        onConfirm={handleReturn}
        onCancel={closeReturnModal}
      />
    </div>
  );
};

export default Sidebar;