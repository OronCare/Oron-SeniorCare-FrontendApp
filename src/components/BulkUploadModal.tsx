import React, { useState, useRef, createElement, Component } from 'react';
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download } from
'lucide-react';
import { Modal, Button } from './UI';
interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sampleCsvData: string;
  onUpload: (data: any[]) => void;
}
export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  title = 'Bulk Upload',
  sampleCsvData,
  onUpload
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file.');
      setFile(null);
      setPreviewData([]);
      return;
    }
    setError(null);
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const lines = text.split('\n').filter((line) => line.trim() !== '');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map((h) => h.trim());
          const parsedData = lines.slice(1).map((line) => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index]?.trim() || '';
            });
            return obj;
          });
          setPreviewData(parsedData);
        }
      }
    };
    reader.readAsText(selectedFile);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };
  const handleRemove = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleUpload = () => {
    if (previewData.length > 0) {
      onUpload(previewData);
      handleRemove();
      onClose();
    }
  };
  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvData], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-600">
            Upload a CSV file to import multiple records at once.
          </p>
          <button
            onClick={handleDownloadSample}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            
            <Download className="h-4 w-4" /> Sample CSV
          </button>
        </div>

        {!file ?
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}>
          
            <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange} />
          
            <div className="mx-auto h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
              CSV files only (max 5MB)
            </p>
          </div> :

        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded shadow-sm">
                  <FileText className="h-6 w-6 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • {previewData.length}{' '}
                    rows found
                  </p>
                </div>
              </div>
              <button
              onClick={handleRemove}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
              
                <X className="h-5 w-5" />
              </button>
            </div>

            {previewData.length > 0 &&
          <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Data Preview (First 3 rows)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        {Object.keys(previewData[0]).
                    slice(0, 5).
                    map((header) =>
                    <th
                      key={header}
                      className="px-4 py-2 font-medium whitespace-nowrap">
                      
                              {header}
                            </th>
                    )}
                        {Object.keys(previewData[0]).length > 5 &&
                    <th className="px-4 py-2 font-medium text-slate-400">
                            ...
                          </th>
                    }
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {previewData.slice(0, 3).map((row, i) =>
                  <tr key={i}>
                          {Object.values(row).
                    slice(0, 5).
                    map((val: any, j) =>
                    <td
                      key={j}
                      className="px-4 py-2 text-slate-700 truncate max-w-[120px]">
                      
                                {val}
                              </td>
                    )}
                          {Object.values(row).length > 5 &&
                    <td className="px-4 py-2 text-slate-400">...</td>
                    }
                        </tr>
                  )}
                    </tbody>
                  </table>
                </div>
              </div>
          }
          </div>
        }

        {error &&
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        }

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            icon={CheckCircle2}
            disabled={!file || previewData.length === 0}
            onClick={handleUpload}>
            
            Upload Data
          </Button>
        </div>
      </div>
    </Modal>);

};