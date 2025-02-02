import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Decimation,
  Legend,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Legend, Decimation, Tooltip);

const ChartDisplay = ({ excelConfig, dataFiles, filterList }) => {

  const chartData = React.useMemo(() => {
    return {
    datasets: dataFiles.map((file, fileIndex) => (file.datasets.map((dataset) => ({
      label: file.name,
      data: dataset.data,
      borderColor: dataset.borderColor || `hsl(${fileIndex * 40}, 70%, 50%)`,
      backgroundColor: dataset.backgroundColor || `hsla(${fileIndex * 40}, 70%, 50%, 0.2)`,
      yAxisID: dataset.yAxisID,
      dataIndex: dataset.dataIndex,
    })))).flat().filter((dataset) => filterList.includes(dataset.dataIndex)) }
  }, [dataFiles, excelConfig, filterList]);

  const chartOptions = {
    type: 'line',
    responsive: true,
    parsing: false,
    normalized: true,    
    animation: false,

    elements: {
      point: {
        radius: 0,
      },
    },

    interaction: {
      mode: "nearest",
      intersect: false,
    },

    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.parsed.y}`;
          },
        },
      },
      decimation: {
        enabled: true,
        algorithm: 'lttb',
        samples: 500,
      },
      legend: {
        display: true,
        position: 'right',
        labels: {
          usePointStyle: true,
          filter: function(item, chart) {
            return filterList? item.datasetIndex % filterList.length === 0 : true;
          }
        },
        onClick: null
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: false,
          text: excelConfig?.xAxisLabel || 'X',
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: false,
          text: excelConfig?.yAxisLabel || '기본 Y 축',
        },
      },
      y2: {
        display: excelConfig.yAxisConfig.some((yConfig) => {return yConfig.yAxisIndex === 'y2'}),
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: false,
          text: excelConfig?.y2AxisLabel || '보조 Y 축',
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h2>{excelConfig?.name || ''}</h2>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default ChartDisplay;