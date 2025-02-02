import React, { useState } from 'react';
import './FrontPage.css';
import { FaEdit, FaTrash, FaPlusCircle, FaCopy } from 'react-icons/fa'; // Import FaPlusCircle icon
import { ConfirmModal, TemplateModal } from './Modals.js';
import Modal from 'react-modal'; // Import react-modal


Modal.setAppElement('#root'); // Adjust if your root element has a different id

const FrontPage = ({ predefinedTemplates, customTemplates, onTemplateSelect, onCopyTemplate, onAddCustomTemplate, onDeleteCustomTemplate, onEditCustomTemplate }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);

  // deleteModal handlers
  const openDeleteModal = (index) => {
    setSelectedIndex(index);
    setDeleteModalOpen(true);
  };
  const handleDelete = () => {
    onDeleteCustomTemplate(selectedIndex);
    closeDeleteModal();
  };
  const closeDeleteModal = () => {
    setSelectedIndex(null);
    setDeleteModalOpen(false);
  };

  // copyModal handlers
  const openCopyModal = (index) => {
    setSelectedIndex(index);
    setCopyModalOpen(true);
  };
  const handleCopyTemplate = () => {
    onCopyTemplate(selectedIndex);
    closeCopyModal();
  };
  const closeCopyModal = () => {
    setSelectedIndex(null);
    setCopyModalOpen(false);
  };



  // templateModal hanlders
  const openAddCustomTemplateModal = () => {
    setEditTemplate(null);
    setSelectedIndex(null);
    setTemplateModalOpen(true);
  }
  const openEditCustomTemplateModal = (index) => {
    setSelectedIndex(index);
    setEditTemplate({ ...customTemplates[index] });
    setTemplateModalOpen(true);
  };
  const handleTemplateSubmit = (submittedTemplate) => {
    if (selectedIndex === null) {
      onAddCustomTemplate(submittedTemplate);
    } else {
      onEditCustomTemplate(selectedIndex, submittedTemplate);
    }
    closeTemplateModal();
  };
  const closeTemplateModal = () => {
    setSelectedIndex(null);
    setEditTemplate(null);
    setTemplateModalOpen(false);
  };


  return (
    <div className="front-page-container">
      <h1 className="front-page-title">엑셀 그래프 템플릿 선택</h1>
      <p className="front-page-subtitle">
        템플릿을 선택하여 간단하게 엑셀 파일을 시각화해 보세요.
      </p>

      {/* Template Lists Container */}
      <div className="front-page-template-container">

        {/* Predefined Templates Section */}
        <div className="front-page-template-section">
          <h2 className="template-section-title">기본 템플릿</h2>
          <div className="front-page-template-list">
            {predefinedTemplates.map((template, index) => (
              <div
                key={index}
                className="front-page-template-item"
                onClick={() => onTemplateSelect(template)}
              >
                <div className="template-item-content">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                </div>

                <div className="template-item-actions">
                  <button className="template-edit-button template-rightmost-button" onClick={(e) => { e.stopPropagation(); openCopyModal(index); }}>
                    <FaCopy size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Custom Templates Section */}
        <div className="front-page-template-section">
          <h2 className="template-section-title">사용자 지정 템플릿</h2>
          <div className="front-page-template-list">
            {customTemplates.map((template, index) => (
              <div
                key={index}
                className="front-page-template-item"
                onClick={() => onTemplateSelect(template)}
              >
                <div className="template-item-content">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                </div>

                <div className="template-item-actions">
                  <button className="template-edit-button" onClick={(e) => { e.stopPropagation(); openEditCustomTemplateModal(index); }}>
                    <FaEdit size={18} />
                  </button>
                  <button className="template-delete-button template-rightmost-button" onClick={(e) => { e.stopPropagation(); openDeleteModal(index); }}>
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
            {/* Add button for custom templates */}
            <button
              className="template-add-button"
              onClick={openAddCustomTemplateModal}
            >
              <FaPlusCircle size={30} />
              <span className="template-add-button-text">템플릿 추가하기</span>
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="템플릿 삭제"
        message={
          <>
            "{customTemplates[selectedIndex]?.name}" 템플릿을 삭제하시겠습니까?
            <br /><br />
            <span style={{ color: 'red' }}>이 선택은 되돌릴 수 없습니다.</span>
          </>
        }
        confirm_text="삭제하기"
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
      <ConfirmModal
        isOpen={isCopyModalOpen}
        title="템플릿 복사"
        message={
          <>
            "{predefinedTemplates[selectedIndex]?.name}" 템플릿의 수정 가능한 복사본을 생성하시겠습니까?
          </>
        }
        confirm_text="생성하기"
        onConfirm={handleCopyTemplate}
        onCancel={closeCopyModal}
      />      
      <TemplateModal
        isOpen={isTemplateModalOpen}
        editTemplate={editTemplate}
        onCancel={closeTemplateModal}
        onSubmit={handleTemplateSubmit}
      />
    </div>
  );
};

export default FrontPage;
