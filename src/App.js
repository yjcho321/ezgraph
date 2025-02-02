import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import ChartDisplay from './ChartDisplay';
import FrontPage from './FrontPage'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import * as XLSX from 'xlsx';

const App = () => {
  const [showFrontPage, setShowFrontPage] = useState(true);

  const [excelConfig, setExcelConfig] = useState(null);
  // dataFiles = {name, file, data}
  const [dataFiles, setDataFiles] = useState([]);
  // importFiles = {index, name, file, progress = (loading | success | fail), message, data}
  const [importFiles, setImportFiles] = useState([]);

  const [filterList, setFilterList] = useState([]);

  // import handlers
  const handleImportInit = (files) => {
    const newFiles = Array.from(files).map((file, index) => ({
      index: index,
      name: file.name,
      file,
      progress: 'loading',
      message: '대기 중',
      datasets: null,
    }));
    setImportFiles(newFiles);

    readFiles(newFiles);
  };
  const handleImportConfirm = (alias) => {
    let successFiles = importFiles.filter(file => file.progress === 'success').map(file => ({
      name: alias[file.index] === '' ? file.file.name : alias[file.index],
      file: file.file,
      datasets: file.datasets,
    }));
    setDataFiles([
      ...dataFiles,
      ...successFiles,
    ])
    setImportFiles([]);
    toast.success(`${successFiles.length}개 파일을 불러왔습니다.`);
  };
  const handleImportCancel = () => {
    setImportFiles([]);
  };


  // delete handlers
  const handleDeleteFile = (index) => {
    let newDataFiles = Array.from(dataFiles);
    newDataFiles.splice(index, 1);
    toast.success(`다음 파일을 삭제하였습니다: ${dataFiles[index].file.name}`);
    setDataFiles(newDataFiles);
  }

  // rename handlers
  const handleRenameFile = (index, newName) => {
    if (newName.trim().length === 0) {
      toast.error(`정상적인 이름이 아닙니다.`);
    }
    else {
      setDataFiles(dataFiles.map((file, i) => {
        if (index == i)
          return { ...file, name: newName };
        return file;
      }));
      toast.success(`'${dataFiles[index].file.name}' 파일의 이름을 '${newName}'로 변경하였습니다.`);
    }
  }

  // data filter handler
  const handleFilterChange = (index, isChecked) => {
    if (isChecked) {
      setFilterList([...filterList, index]);
    } else {
      setFilterList(filterList.filter((item) => { return index !== item }));
    }
  }

  // functions to import .xlsx files
  const readFiles = async (files) => {
    let counter = 0;
    for (const [index, file] of files.entries()) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const result = processWorkbook(file, workbook);
        file.message = result.message;
        file.progress = result.success ? 'success' : 'fail';
        if (result.success)
          file.datasets = result.datasets;

        setImportFiles(files => files.map((_file, _index) => (_index === index ? file : _file)));
        counter++;
      };
      reader.readAsArrayBuffer(file.file);

      // use counter to read files sequentially
      while (counter === index)
        await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  const processWorkbook = (file, workbook) => {
    if (!workbook)
      return { success: false, message: `엑셀파일 읽기 오류` }
    if (!excelConfig)
      return { success: false, message: `그래프 템플릿 설정 오류` };

    for (const sheet of excelConfig.sheets) {
      const worksheet = workbook.Sheets[sheet.name];
      if (!worksheet)
        return { success: false, message: `'${sheet.name}' 시트를 찾을 수 없음` };
    }

    const { sheets, xAxisConfig, yAxisConfig } = excelConfig;
    let raw_data = { x: [], y: [] };

    for (const xConfig of xAxisConfig) {
      const { sheetIndex, columnIndex, startRow, endRow } = xConfig;
      const worksheet = workbook.Sheets[sheets[sheetIndex].name];
      let values = [];
      for (let row = startRow; row <= endRow; row++) {
        const cellAddress = `${columnIndex}${row}`;
        const cell = worksheet[cellAddress];
        if (!cell)
          return { success: false, message: `'${sheets[sheetIndex].name}' 시트의 '${cellAddress}' 셀에 데이터가 없음` };
        values.push(cell.v);
      }
      raw_data.x.push(values);
    }

    for (const yConfig of yAxisConfig) {
      const { sheetIndex, columnIndex, startRow, endRow } = yConfig;
      const worksheet = workbook.Sheets[sheets[sheetIndex].name];
      let values = [];
      for (let row = startRow; row <= endRow; row++) {
        const cellAddress = `${columnIndex}${row}`
        const cell = worksheet[cellAddress];
        if (!cell)
          return { success: false, message: `'${sheets[sheetIndex].name}' 시트의 '${cellAddress}' 셀에 데이터가 없음` };
        values.push(cell.v);
      }
      raw_data.y.push(values);
    }

    const datasets = raw_data.y.map((ySet, i) => {
      const { name, yAxisIndex, xConfigIndex } = yAxisConfig[i];
      return {
        dataIndex: i,
        yAxisID: yAxisIndex,
        data: ySet.map((_y, _i) => ({ x: raw_data.x[xConfigIndex][_i], y: _y }))
      }
    });

    return { success: true, message: '파일 불러오기 성공', datasets: datasets };
  }

  // predefined templates
  const templates = [
    {
      name: '점착제 Strain 데이터 분석',
      description: 'Creep 및 Recovery 단계에서 Strain 데이터 그래프 생성',
      sheets: [{ name: 'Creep - repeat 1' }, { name: 'Recovery - repeat 1' }],
      xAxisConfig: [
        { sheetIndex: 0, columnIndex: 'G', startRow: 4, endRow: 6003 },
        { sheetIndex: 1, columnIndex: 'G', startRow: 4, endRow: 6003 },
      ],
      yAxisConfig: [
        { name: 'Creep Strain', yAxisIndex: 'y', xConfigIndex: 0, sheetIndex: 0, columnIndex: 'H', startRow: 4, endRow: 6003 },
        { name: 'Creep -Strain', yAxisIndex: 'y2', xConfigIndex: 0, sheetIndex: 0, columnIndex: 'I', startRow: 4, endRow: 6003 },
        { name: 'Recovery Strain', yAxisIndex: 'y', xConfigIndex: 1, sheetIndex: 1, columnIndex: 'H', startRow: 4, endRow: 6003 },
        { name: 'Recovery -Strain', yAxisIndex: 'y2', xConfigIndex: 1, sheetIndex: 1, columnIndex: 'I', startRow: 4, endRow: 6003 },
      ],
    },
   ];

  const [customTemplates, setCustomTemplates] = useState([]);

  // template handlers
  const handleSelectTemplate = (template) => {
    setExcelConfig(template);
    setDataFiles([]);
    setFilterList(template.yAxisConfig.map((_, index) => index));
    setShowFrontPage(false);
  };

  const handleAddTemplate = (template) => {
    toast.success(`다음 템플릿을 추가하였습니다: ${template.name}`);
    setCustomTemplates([...customTemplates, template])
  }
  const handleCopyTemplate = (index) => {
    toast.success(`다음 템플릿을 복사하였습니다: ${templates[index].name}`);
    setCustomTemplates([...customTemplates, templates[index]])
  }
  const handleEditTemplate = (index, template) => {
    toast.success(`다음 템플릿을 수정하였습니다: ${customTemplates[index].name}`);
    setCustomTemplates(customTemplates.map((t, i) => {
      if(i === index)
        return template;
      return t;
    } ));
  }
  const handleDeleteTemplate = (index) => {
    let newCustomTemplates = Array.from(customTemplates);
    newCustomTemplates.splice(index, 1);
    toast.success(`다음 템플릿을 삭제하였습니다: ${customTemplates[index].name}`);
    setCustomTemplates(newCustomTemplates);
  }

  const handleReturnToFrontPage = () => {
    setShowFrontPage(true);
  }


  return (
    <>
      {showFrontPage ? (
        <FrontPage
          predefinedTemplates={templates}
          customTemplates={customTemplates}
          onTemplateSelect={handleSelectTemplate}
          onCopyTemplate={handleCopyTemplate}
          onAddCustomTemplate={handleAddTemplate}
          onEditCustomTemplate={handleEditTemplate}
          onDeleteCustomTemplate={handleDeleteTemplate} />
      ) : (
        <div className="app-container">
          <Sidebar
            excelConfig={excelConfig}
            dataFiles={dataFiles}
            importFiles={importFiles}
            filterList={filterList}
            onImportInit={handleImportInit}
            onImportConfirm={handleImportConfirm}
            onImportCancel={handleImportCancel}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            onFilterChange={handleFilterChange}
            onReturnToFrontPage={handleReturnToFrontPage} />
          <div className="main-content">
            <ChartDisplay
              excelConfig={excelConfig}
              dataFiles={dataFiles}
              filterList={filterList}
            />
          </div>
        </div>
      )}
      
      <ToastContainer position="top-center" />
    </>
  );
};

export default App;
