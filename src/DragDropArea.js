import './DragDropArea.css';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Logo = () => (
    <svg className="icon" x="0px" y="0px" viewBox="0 0 24 24">
      <path fill="transparent" d="M0,0h24v24H0V0z" />
      <path
        fill="#000"
        d="M20.5,5.2l-1.4-1.7C18.9,3.2,18.5,3,18,3H6C5.5,3,5.1,3.2,4.8,3.5L3.5,5.2C3.2,5.6,3,6,3,6.5V19  c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V6.5C21,6,20.8,5.6,20.5,5.2z M12,17.5L6.5,12H10v-2h4v2h3.5L12,17.5z M5.1,5l0.8-1h12l0.9,1  H5.1z"
      />
    </svg>
  );
  
const DragDropArea = ({validExtensions = ["*"], onAddFile}) => {
  const [isDragOver, setIsDragOver] = useState(false);


  const handleFileChange = (files) => {
    const invalidFiles = Array.from(files).filter(file => !isValidExtension(file));
    if (invalidFiles.length > 0) {
      toast.error(`다음 파일들의 확장자를 확인하세요: ${invalidFiles.map(file => file.name).join(', ')}`);
      return;
    }
    onAddFile(Array.from(files));
  }

  const handleFileInput = (e) => {
    if(e.target.files) {
      handleFileChange(e.target.files);
    }
    e.target.value = "";
  }
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if(e.dataTransfer) {
      handleFileChange(e.dataTransfer.files)
    }
  }
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const isValidExtension = (file) => {
    const fileName = file.name;
    if(!fileName.includes('.'))
      return false;
    const fileExtension = fileName.split('.').pop(0);
    return validExtensions.includes(fileExtension) || validExtensions.includes('*');
  }

    return (
      <label className={`preview${isDragOver ? " preview_drag" : ""}`}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
      >
        <input type="file" className="file" multiple 
          onChange={handleFileInput}/>
        <Logo />
        <p className="preview_msg">클릭 혹은 파일을 이곳에 드롭하세요.</p>
      </label>
    );
};

export default DragDropArea