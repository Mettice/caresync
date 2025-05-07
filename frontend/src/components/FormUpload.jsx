import React, { useState, useRef } from 'react';
import axios from 'axios';

const FormUpload = ({ endpoint = 'http://localhost:9999/api/upload' }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const allowedTypes = ['.pdf', '.docx', '.txt'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const resetState = () => {
    setFiles([]);
    setUploadProgress({});
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file) => {
    // Check if file is actually empty
    if (file.size === 0) {
      return `File "${file.name}" is empty`;
    }

    // Check file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      return `Invalid file type for "${file.name}". Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size: ${maxSize / 1024 / 1024}MB`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    setError(null);
    setSuccess(null);

    // Validate each file
    const errors = [];
    const validFiles = newFiles.filter(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        return false;
      }
      return true;
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      // Check for duplicates
      const newValidFiles = validFiles.filter(newFile => 
        !files.some(existingFile => 
          existingFile.name === newFile.name && 
          existingFile.size === newFile.size
        )
      );

      if (newValidFiles.length > 0) {
        setFiles(prev => [...prev, ...newValidFiles]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress({});

    const uploadPromises = files.map(async (file, index) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [index]: Math.round(progress)
            }));
          },
        });
        return { success: true, filename: file.name, message: response.data.message };
      } catch (err) {
        return { 
          success: false, 
          filename: file.name, 
          error: err.response?.data?.detail || 'Upload failed'
        };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      
      // Process results
      const successes = results.filter(r => r.success);
      const failures = results.filter(r => !r.success);
      
      if (failures.length > 0) {
        setError(failures.map(f => `${f.filename}: ${f.error}`).join('\n'));
      }
      
      if (successes.length > 0) {
        setSuccess(`Successfully uploaded ${successes.length} file(s)`);
        // Remove successful uploads from the files list
        setFiles(prev => prev.filter((_, i) => !results[i].success));
      }
    } catch (err) {
      setError('Error uploading files. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 shadow-lg border border-gray-200/50">
      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Documents
          </label>
          <div 
            className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors duration-200
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept={allowedTypes.join(',')}
                    multiple
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOCX, or TXT up to 10MB each
              </p>
            </div>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Files ({files.length})
              </h3>
              <button
                type="button"
                onClick={resetState}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove All
              </button>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center flex-1 min-w-0">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-900 truncate">{file.name}</span>
                  </div>
                  {uploadProgress[index] !== undefined && (
                    <div className="w-20 h-1 bg-gray-200 rounded-full mx-2">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[index]}%` }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={files.length === 0 || uploading}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
              ${
                files.length === 0 || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }
              transition-colors duration-200`}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormUpload;