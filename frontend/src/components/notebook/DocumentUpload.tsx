import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import GradientCard from '@/components/ui/GradientCard';

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: Date;
}

interface DocumentUploadProps {
  onDocumentProcessed: (document: UploadedDocument) => void;
}

export default function DocumentUpload({ onDocumentProcessed }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File): Promise<UploadedDocument> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          let content = '';

          if (file.type === 'text/plain') {
            content = e.target?.result as string;
          } else if (file.type === 'application/pdf') {
            // For PDF files, we'll use a simple text extraction
            // In a real implementation, you'd use pdf-parse or similar
            content = `PDF Content: ${file.name}\n\n[This is a placeholder for PDF text extraction. In production, use pdf-parse library to extract actual text content.]`;
          } else {
            content = `Unsupported file type: ${file.type}\n\n[Content extraction not implemented for this file type.]`;
          }

          const document: UploadedDocument = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            content,
            uploadedAt: new Date()
          };

          resolve(document);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        // For other file types, just create a placeholder
        reader.readAsText(file);
      }
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    setIsProcessing(true);

    try {
      const processedFiles = await Promise.all(
        files.map(file => processFile(file))
      );

      setUploadedFiles(prev => [...prev, ...processedFiles]);
      processedFiles.forEach(doc => onDocumentProcessed(doc));
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onDocumentProcessed]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setIsProcessing(true);

    try {
      const processedFiles = await Promise.all(
        files.map(file => processFile(file))
      );

      setUploadedFiles(prev => [...prev, ...processedFiles]);
      processedFiles.forEach(doc => onDocumentProcessed(doc));
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <GradientCard>
      <div className="flex items-center space-x-2 mb-4">
        <Upload size={20} className="text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Document Upload</h3>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <Upload size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-white/60 mb-4">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-sm text-white/40 mb-4">
          Supports: PDF, TXT, DOC files
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg cursor-pointer transition-colors"
        >
          Choose Files
        </label>
      </div>

      {isProcessing && (
        <div className="mt-4 text-center text-cyan-400">
          Processing files...
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-white/80">Uploaded Files:</h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-cyan-400" />
                <div>
                  <p className="text-sm text-white font-medium">{file.name}</p>
                  <p className="text-xs text-white/40">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-400" />
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GradientCard>
  );
}