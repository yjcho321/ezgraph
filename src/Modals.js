import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaCheckCircle, FaSpinner, FaTimesCircle, FaTrash, FaPlusCircle } from 'react-icons/fa';
import './Modals.css';
import { toast } from 'react-toastify';
import { useForm, useFieldArray, useWatch } from "react-hook-form";


Modal.setAppElement('#root');

const FileImportModal = ({ isOpen, importFiles, onImport, onCancel }) => {

  // hooks to initialize and clear alias array
  useEffect(() => {
    if (importFiles.length === 0) {
      setAlias(null);
    } else if (!alias) {
      setAlias(Array.from(importFiles).map(i => ''));
    }
  }, [importFiles])


  // array to store user-defined alias for files to import
  const [alias, setAlias] = useState(null);

  // input field updater
  const onAliasChange = (index, evt) => {
    setAlias(alias => alias.map((_alias, _index) => (_index === index ? evt.target.value : _alias)));
  }

  // constants for import/cancel button disabling
  const isLoading = importFiles.some(file => file.progress === 'loading');
  const hasSuccess = importFiles.some(file => file.progress === 'success');

  // hooks to show toast message when loading is complete
  useEffect(() => {
    if (!isLoading && importFiles.length > 0) {
      let numSuccess = importFiles.filter(file => file.progress === 'success').length;
      let numFail = importFiles.filter(file => file.progress === 'fail').length;

      if (numSuccess === 0) {
        toast.error(`오류내용을 확인 후 다시 시도하세요.`);
      } else if (numFail !== 0) {
        toast.info(`오류가 발생한 ${numFail}개 파일을 제외한 ${numSuccess}개 파일만 불러올 수 있습니다.`)
      }
    }
  }, [isLoading])

  const getIcon = (progress) => {
    switch (progress) {
      case 'success':
        return <FaCheckCircle className="file-icon success" />;
      case 'fail':
        return <FaTimesCircle className="file-icon error" />;
      default:
        return <FaSpinner className="file-icon loading" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      className="file-import-modal default-modal"
      overlayClassName="modal-overlay"
    >
      <h2 className="modal-header">파일 불러오기</h2>
      <div className="modal-content">

        <ul className="file-list">
          {importFiles.map((file, index) => (
            <li key={index} className="file-item">
              <div className="icon-container">
                {getIcon(file.progress)}
              </div>
              <div className="file-info">
                <input
                  type="text"
                  value={alias ? alias[index] : ''}
                  placeholder={file.name}
                  onChange={(e) => onAliasChange(index, e)}
                  className="file-name-input"
                />
                <div className="file-message">{file.message}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="modal-footer">
        <button className="modal-button confirm-button" onClick={() => onImport(alias)} disabled={isLoading || !hasSuccess}>불러오기</button>
        <button className="modal-button cancel-button" onClick={onCancel} disabled={isLoading}>취소</button>
      </div>
    </Modal>
  );
};

const ConfirmModal = ({ isOpen, title, message, confirm_text, cancel_text = "취소", onConfirm, onCancel }) => {
  // close with escape
  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === "Escape") onCancel();
    };
    if (isOpen)
      window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen, onCancel]);

  return (
    <Modal
      isOpen={isOpen}
      className="default-modal confirm-modal"
      overlayClassName="modal-overlay"
    >
      <h2 className="modal-header">{title}</h2>
      <div className="modal-content">
        {message}
      </div>
      <div className="modal-footer">
        <button className="modal-button confirm-button" onClick={onConfirm}>{confirm_text}</button>
        <button className="modal-button cancel-button" onClick={onCancel}>{cancel_text}</button>
      </div>
    </Modal>
  );
};


const FileRenameModal = ({ isOpen, fileName, onRename, onCancel }) => {
  // close with escape
  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === "Escape") onCancel();
    };
    if (isOpen)
      window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen, onCancel]);

  const [newFileName, setNewFileName] = useState(fileName);

  const handleChange = (e) => {
    setNewFileName(e.target.value);
  };

  React.useEffect(() => {
    if (isOpen) {
      setNewFileName(fileName);
    }
  }, [isOpen, fileName]);

  return (
    <Modal
      isOpen={isOpen}
      className="default-modal rename-modal"
      overlayClassName="modal-overlay"
    >
      <h2 className="modal-header">파일 이름 변경</h2>
      <div className="modal-content">
        <input
          type="text"
          value={newFileName}
          onChange={handleChange}
          className="file-rename-input"
          placeholder="Enter new file name"
        />
      </div>
      <div className="modal-footer">
        <button
          className="modal-button confirm-button"
          onClick={() => onRename(newFileName)}
        >
          변경하기
        </button>
        <button className="modal-button cancel-button" onClick={onCancel}>
          취소
        </button>
      </div>
    </Modal>
  );
};

const TemplateModal = ({ isOpen, editTemplate, onSubmit, onCancel }) => {


  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
      sheets: [{ name: "" }],
      xAxisConfig: [{ sheetIndex: "", columnIndex: "", startRow: "", endRow: "" }],
      yAxisConfig: [
        {
          name: "",
          yAxisIndex: "",
          xConfigIndex: "",
          sheetIndex: "",
          columnIndex: "",
          startRow: "",
          endRow: "",
        },
      ],
    },
  });

  // Field arrays for dynamic inputs
  const { fields: sheetFields, append: addSheet, remove: removeSheet } = useFieldArray({
    control,
    name: "sheets",
    rules: {
      required: true,
    },
  });

  const { fields: xAxisFields, append: addXAxis, remove: removeXAxis } = useFieldArray({
    control,
    name: "xAxisConfig",
    rules: {
      required: true,
    },
  });

  const { fields: yAxisFields, append: addYAxis, remove: removeYAxis } = useFieldArray({
    control,
    name: "yAxisConfig",
    rules: {
      required: true,
    },
  });

  const watchSheet = useWatch({
    control,
    name: "sheets",
  });

  const watchXConfig = useWatch({
    control,
    name: "xAxisConfig",
  });

  useEffect(() => {
    if (isOpen) {
      if (editTemplate) {
        reset(editTemplate);
      }
    } else {
      reset({
        name: "",
        description: "",
        sheets: [{ name: "" }],
        xAxisConfig: [{ sheetIndex: "", columnIndex: "", startRow: "", endRow: "" }],
        yAxisConfig: [{ name: "", yAxisIndex: "", xConfigIndex: "", sheetIndex: "", columnIndex: "", startRow: "", endRow: "" },
        ],
      },);
    }
  }, [isOpen]);


  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  const yAxis = [{ name: "기본", value: "y" }, { name: "보조축", value: "y2" }];

  return (
    <Modal isOpen={isOpen} className="template-modal default-modal" overlayClassName="modal-overlay">
      <h2 className="modal-header">{`템플릿 ${editTemplate ? "수정" : "추가"}`}</h2>

      <form className="template-modal-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-content">
          {/* Name */}
          <div className="template-modal-section">
            <h3 className="template-modal-section-heading">이름</h3>
            <input {...register("name", {required: '이름없으면안돼'})} className="template-modal-input" placeholder="이름을 입력하세요" />

            <h3 className="template-modal-section-heading">설명</h3>
            <input {...register("description")} className="template-modal-input" placeholder="설명을 입력하세요 (생략 가능)" />
          </div>

          {/* Sheets Section */}
          <div className="template-modal-section">
            <h3 className="template-modal-section-heading">엑셀 시트 설정</h3>
            {sheetFields.map((field, index) => (
              <div className="template-item-container">
                <input
                  {...register(`sheets.${index}.name`, { required: true })}
                  className="template-modal-input template-modal-input-grow"
                  placeholder={`사용할 시트 ${index + 1} 이름`}
                  key={field.id}
                />
                <button
                  className="template-container-delete-button"
                  onClick={() => removeSheet(index)}
                >
                  <FaTrash size={18} />
                </button>
              </div>
            ))}
            <button
              className="template-container-add-button"
              onClick={() => addSheet({ name: "" })}
            >
              <FaPlusCircle size={18} />
              <span className="template-container-add-button-text">엑셀 시트 추가</span>
            </button>
          </div>

          {/* X-Axis Configurations */}
          <div className="template-modal-section">
            <h3 className="template-modal-section-heading">X축 데이터 설정</h3>
            {xAxisFields.map((field, index) => (
              <div key={field.id} className="template-item-container">
                <select
                  {...register(`xAxisConfig.${index}.sheetIndex`, { required: true })}
                  className="template-modal-input template-modal-input-grow"
                >
                  <option value="">시트 선택</option>
                  {watchSheet.map((sheet, i) => (
                    <option key={i} value={i}>
                      {sheet.name ? `시트 ${i + 1} - ${sheet.name}` : `시트 ${i + 1}`}
                    </option>
                  ))}
                </select>
                <select
                  {...register(`xAxisConfig.${index}.columnIndex`, { required: true })}
                  className="template-modal-input template-modal-input-150"
                >
                  <option value="">열 선택</option>
                  {columns.map((val, i) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
                <input {...register(`xAxisConfig.${index}.startRow`, { required: true })} className="template-modal-input template-modal-input-100" placeholder="첫 행" />
                <input {...register(`xAxisConfig.${index}.endRow`, { required: true })} className="template-modal-input template-modal-input-100" placeholder="마지막 행" />
                <button
                  className="template-container-delete-button"
                  onClick={() => removeXAxis(index)}
                >
                  <FaTrash size={18} />
                </button>
              </div>
            ))}
            <button className="template-container-add-button" onClick={() => addXAxis({ sheetIndex: "", columnIndex: "", startRow: "", endRow: "" })}>
              <FaPlusCircle size={18} />
              <span className="template-container-add-button-text">X 데이터 추가</span>
            </button>
          </div>

          {/* Y-Axis Configurations */}
          <div className="template-modal-section">
            <h3 className="template-modal-section-heading">Y축 데이터 설정</h3>
            {yAxisFields.map((field, index) => (
              <div key={field.id} className="template-item-container">
                <div className="template-item-container-2row">
                  <input {...register(`yAxisConfig.${index}.name`, { required: true })} className="template-modal-input template-modal-input-grow" placeholder="데이터 이름" />
                  <select
                    {...register(`yAxisConfig.${index}.yAxisIndex`, { required: true })}
                    className="template-modal-input template-modal-input-150"
                  >
                    <option value="">Y축 선택</option>
                    {yAxis.map((axis, i) => (
                      <option key={axis.name} value={axis.value}>
                        {axis.name}
                      </option>
                    ))}
                  </select>
                  <select
                    {...register(`yAxisConfig.${index}.xConfigIndex`, { required: true })}
                    className="template-modal-input template-modal-input-300"
                  >
                    <option value="">X 데이터 선택</option>
                    {watchXConfig.map((xConfig, i) => (
                      <option key={i} value={i}>
                        {xConfig.columnIndex !== "" ? `X${i + 1} - ${xConfig.columnIndex}${xConfig.startRow}:${xConfig.columnIndex}${xConfig.endRow}` : `X${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="template-item-container-2row">
                  <select
                    {...register(`yAxisConfig.${index}.sheetIndex`, { required: true })}
                    className="template-modal-input template-modal-input-grow"
                  >
                    <option value="">시트 선택</option>
                    {watchSheet.map((sheet, i) => (
                      <option key={i} value={i}>
                        {sheet.name ? `시트 ${i + 1} - ${sheet.name}` : `시트 ${i + 1}`}
                      </option>
                    ))}
                  </select>
                  <select
                    {...register(`yAxisConfig.${index}.columnIndex`, { required: true })}
                    className="template-modal-input template-modal-input-150"
                  >
                    <option value="">열 선택</option>
                    {columns.map((val, i) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                  <input {...register(`yAxisConfig.${index}.startRow`, { required: true })} className="template-modal-input template-modal-input-100" placeholder="첫 행" />
                  <input {...register(`yAxisConfig.${index}.endRow`, { required: true })} className="template-modal-input template-modal-input-100" placeholder="마지막 행" />
                  <button
                    className="template-container-delete-button"
                    onClick={() => removeYAxis(index)}
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
            <button className="template-container-add-button" onClick={() => addYAxis({ name: "", yAxisIndex: "", xConfigIndex: "", sheetIndex: "", columnIndex: "", startRow: "", endRow: "" })}>
              <FaPlusCircle size={18} />
              <span className="template-container-add-button-text">Y 데이터 추가</span>
            </button>
          </div>

          {/* Submit Button */}

        </div>
        <div className="modal-footer">
          <button className="modal-button confirm-button" type="submit">{`${editTemplate ? "수정하기" : "추가하기"}`}</button>
          <button className="modal-button cancel-button" onClick={() => { onCancel(); }}>취소</button>
        </div>
      </form>
    </Modal>
  );
};


export { FileImportModal, ConfirmModal, FileRenameModal, TemplateModal };