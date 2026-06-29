import { forwardRef, useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    X,
    File as FileIcon,
    Image as ImageIcon,
    FileText,
    FileSpreadsheet,
    Archive,
    Music,
    Video,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { FileInputProps } from "./types";
import { Button } from "@/Components/Button";
import { cn } from "@/lib/utils";

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
    (
        {
            label,
            placeholder = "Click to upload or drag and drop",
            error,
            success,
            warning,
            hint,
            variant = "default",
            size = "md",
            status = "default",
            disabled = false,
            loading = false,
            fullWidth = true,
            className = "",
            containerClassName = "",
            accept,
            multiple = false,
            maxFiles = multiple ? 10 : 1,
            maxFileSize = 10 * 1024 * 1024,
            allowedFileTypes = [],
            onFileSelect,
            onFileRemove,
            preview = true,
            dragAndDrop = true,
            uploadProgress = [],
            files = [],
            showFileList = true,
            dropzoneText = "Drop files here...",
            browseText = "Browse files",
            removeText = "Remove",
            fileListClassName = "",
            id,
            inputRef,
            required,
            optional,
            ...props
        },
        ref,
    ) => {
        const [selectedFiles, setSelectedFiles] = useState<File[]>(files);
        const [dragActive, setDragActive] = useState(false);
        const [previews, setPreviews] = useState<{ [key: string]: string }>({});
        const [isFocused, setIsFocused] = useState(false);

        const internalInputRef = useRef<HTMLInputElement>(null);
        const fileInputRef = inputRef || ref || internalInputRef;

        const inputId =
            id || `file-input-${Math.random().toString(36).substr(2, 9)}`;
        const actualStatus = error
            ? "error"
            : success
              ? "success"
              : warning
                ? "warning"
                : status;

        const getFileIcon = useCallback((file: File) => {
            const type = file.type.toLowerCase();
            const name = file.name.toLowerCase();

            if (type.startsWith("image/"))
                return <ImageIcon className="w-4 h-4" />;
            if (type.includes("pdf") || name.endsWith(".pdf"))
                return <FileText className="w-4 h-4" />;
            if (
                type.includes("spreadsheet") ||
                name.endsWith(".xlsx") ||
                name.endsWith(".xls")
            )
                return <FileSpreadsheet className="w-4 h-4" />;
            if (
                type.includes("zip") ||
                type.includes("rar") ||
                name.endsWith(".zip") ||
                name.endsWith(".rar")
            )
                return <Archive className="w-4 h-4" />;
            if (type.startsWith("audio/")) return <Music className="w-4 h-4" />;
            if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
            return <FileIcon className="w-4 h-4" />;
        }, []);

        const validateFile = useCallback(
            (file: File): string | null => {
                if (maxFileSize && file.size > maxFileSize) {
                    return `File size must be less than ${formatFileSize(maxFileSize)}`;
                }

                if (allowedFileTypes.length > 0) {
                    const isAllowed = allowedFileTypes.some(
                        (type) =>
                            file.type.includes(type) ||
                            file.name
                                .toLowerCase()
                                .endsWith(type.replace(".", "")),
                    );
                    if (!isAllowed) {
                        return `File type not allowed. Allowed types: ${allowedFileTypes.join(", ")}`;
                    }
                }

                return null;
            },
            [maxFileSize, allowedFileTypes],
        );

        const formatFileSize = useCallback((bytes: number): string => {
            if (bytes === 0) return "0 Bytes";
            const k = 1024;
            const sizes = ["Bytes", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return (
                parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
            );
        }, []);

        const createPreview = useCallback((file: File) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviews((prev) => ({
                        ...prev,
                        [file.name]: e.target?.result as string,
                    }));
                };
                reader.readAsDataURL(file);
            }
        }, []);

        const handleFileSelect = useCallback(
            (newFiles: File[]) => {
                const validFiles: File[] = [];
                const errors: string[] = [];

                newFiles.forEach((file) => {
                    const error = validateFile(file);
                    if (error) {
                        errors.push(`${file.name}: ${error}`);
                    } else {
                        validFiles.push(file);
                        if (preview) {
                            createPreview(file);
                        }
                    }
                });

                if (errors.length > 0) {
                    console.warn("File validation errors:", errors);
                }

                let updatedFiles: File[];
                if (multiple) {
                    updatedFiles = [...selectedFiles, ...validFiles];
                    if (maxFiles && updatedFiles.length > maxFiles) {
                        updatedFiles = updatedFiles.slice(0, maxFiles);
                    }
                } else {
                    updatedFiles = validFiles.slice(0, 1);
                }

                setSelectedFiles(updatedFiles);
                onFileSelect?.(updatedFiles);
            },
            [
                selectedFiles,
                multiple,
                maxFiles,
                validateFile,
                preview,
                createPreview,
                onFileSelect,
            ],
        );

        const handleNativeInputChange = useCallback(
            (event: React.ChangeEvent<HTMLInputElement>) => {
                const files = Array.from(event.target.files || []);
                if (files.length > 0) {
                    handleFileSelect(files);
                }
                event.target.value = "";
            },
            [handleFileSelect],
        );

        const handleFileRemove = useCallback(
            (index: number) => {
                const updatedFiles = selectedFiles.filter(
                    (_, i) => i !== index,
                );
                const removedFile = selectedFiles[index];

                if (removedFile && previews[removedFile.name]) {
                    setPreviews((prev) => {
                        const newPreviews = { ...prev };
                        delete newPreviews[removedFile.name];
                        return newPreviews;
                    });
                }

                setSelectedFiles(updatedFiles);
                onFileRemove?.(index);
                onFileSelect?.(updatedFiles);
            },
            [selectedFiles, previews, onFileRemove, onFileSelect],
        );

        const handleBrowseClick = useCallback(
            (event: React.MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();

                if (disabled || loading) return;

                const input =
                    typeof fileInputRef === "function"
                        ? null
                        : fileInputRef?.current;

                if (input) {
                    input.click();
                } else {
                    const fallbackInput = document.getElementById(
                        inputId,
                    ) as HTMLInputElement;
                    if (fallbackInput) {
                        fallbackInput.click();
                    }
                }
            },
            [disabled, loading, fileInputRef, inputId],
        );

        const handleDropzoneClick = useCallback(
            (event: React.MouseEvent) => {
                const target = event.target as HTMLElement;
                if (target.closest("button")) {
                    return;
                }
                handleBrowseClick(event);
            },
            [handleBrowseClick],
        );

        const onDrop = useCallback(
            (acceptedFiles: File[]) => {
                setDragActive(false);
                handleFileSelect(acceptedFiles);
            },
            [handleFileSelect],
        );

        const onDragEnter = useCallback(() => {
            setDragActive(true);
        }, []);

        const onDragLeave = useCallback(() => {
            setDragActive(false);
        }, []);

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop,
            onDragEnter,
            onDragLeave,
            accept: accept
                ? {
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                          [".xlsx"],
                      "application/vnd.ms-excel": [".xls"],
                      "text/csv": [".csv"],
                  }
                : undefined,
            multiple,
            maxFiles,
            maxSize: maxFileSize,
            disabled: disabled || loading,
            noClick: true,
            noKeyboard: true,
        });

        const sizeClasses = {
            xs: "p-4 min-h-[80px]",
            sm: "p-6 min-h-[100px]",
            md: "p-8 min-h-[120px]",
            lg: "p-10 min-h-[140px]",
            xl: "p-12 min-h-[160px]",
        };

        const getDropzoneClasses = () => {
            return cn(
                "border-2 border-dashed rounded-lg transition-all duration-200",
                "flex flex-col items-center justify-center text-center",
                "group relative overflow-hidden",
                dragActive || isDragActive
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/10 scale-[1.02]"
                    : actualStatus === "error"
                      ? "border-[var(--color-error-300)] bg-red-50/50 dark:bg-red-950/10"
                      : actualStatus === "success"
                        ? "border-[var(--color-success-300)] bg-green-50/50 dark:bg-green-950/10"
                        : actualStatus === "warning"
                          ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/10"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)]/50",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                !disabled && "cursor-pointer",
                isFocused &&
                    "ring-2 ring-[var(--color-primary-500)]/20 ring-offset-2",
            );
        };

        useEffect(() => {
            if (files !== selectedFiles) {
                setSelectedFiles(files);
                files.forEach((file) => {
                    if (preview && file.type.startsWith("image/")) {
                        createPreview(file);
                    }
                });
            }
        }, [files, selectedFiles, preview, createPreview]);

        return (
            <div className={cn("flex flex-col space-y-2", containerClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "block text-sm font-medium transition-colors",
                            error
                                ? "text-[var(--color-error-500)]"
                                : success
                                  ? "text-[var(--color-success-600)]"
                                  : isFocused
                                    ? "text-[var(--color-primary-500)]"
                                    : "text-[var(--color-text-primary)]",
                            disabled && "opacity-50",
                        )}
                    >
                        {label}
                        {required && (
                            <span className="ml-1 text-[var(--color-error-500)]">
                                *
                            </span>
                        )}
                        {optional && !required && (
                            <span className="ml-2 text-xs text-[var(--color-text-tertiary)] font-normal italic">
                                Optional
                            </span>
                        )}
                    </label>
                )}

                <input
                    type="file"
                    id={inputId}
                    ref={fileInputRef}
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled || loading}
                    onChange={handleNativeInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="sr-only"
                    aria-describedby={
                        error
                            ? `${inputId}-error`
                            : hint
                              ? `${inputId}-hint`
                              : undefined
                    }
                    {...props}
                />

                {dragAndDrop ? (
                    <div
                        {...getRootProps()}
                        className={cn(
                            getDropzoneClasses(),
                            sizeClasses[size],
                            fullWidth ? "w-full" : "w-auto",
                            className,
                        )}
                        onClick={handleDropzoneClick}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <Upload
                            className={cn(
                                "mb-3 transition-all duration-300",
                                "w-8 h-8",
                                dragActive || isDragActive
                                    ? "text-[var(--color-primary-500)] scale-110"
                                    : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary-500)] group-hover:scale-110",
                                loading && "animate-pulse",
                            )}
                        />

                        <div className="space-y-2 relative z-10">
                            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                                {dragActive || isDragActive
                                    ? dropzoneText
                                    : placeholder}
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)]">
                                or{" "}
                                <Button
                                    type="button"
                                    variant="link"
                                    size="xs"
                                    onClick={handleBrowseClick}
                                    disabled={disabled || loading}
                                    className="p-0 h-auto font-semibold underline-offset-2"
                                >
                                    {browseText}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-3 text-xs text-[var(--color-text-tertiary)] space-y-1">
                            {maxFileSize && (
                                <div>
                                    Max file size: {formatFileSize(maxFileSize)}
                                </div>
                            )}
                            {allowedFileTypes.length > 0 && (
                                <div>
                                    Allowed: {allowedFileTypes.join(", ")}
                                </div>
                            )}
                            {multiple && maxFiles && (
                                <div>Max {maxFiles} files</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBrowseClick}
                        disabled={disabled || loading}
                        leftIcon={
                            loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )
                        }
                        className="w-full justify-center"
                    >
                        {browseText}
                    </Button>
                )}

                {showFileList && selectedFiles.length > 0 && (
                    <div
                        className={cn(
                            "space-y-3 animate-in slide-in-from-top-2 fade-in",
                            fileListClassName,
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                                Selected Files ({selectedFiles.length}
                                {maxFiles && ` / ${maxFiles}`})
                            </div>
                            {selectedFiles.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => {
                                        setSelectedFiles([]);
                                        setPreviews({});
                                        onFileSelect?.([]);
                                    }}
                                    disabled={disabled || loading}
                                    className="text-xs"
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={`${file.name}-${index}`}
                                    className={cn(
                                        "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                                        "bg-[var(--color-surface)] border-[var(--color-border)]",
                                        "hover:border-[var(--color-primary-300)] hover:shadow-sm",
                                    )}
                                >
                                    <div className="flex-shrink-0">
                                        {preview && previews[file.name] ? (
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-1 ring-[var(--color-border)]">
                                                <img
                                                    src={previews[file.name]}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-800)] text-[var(--color-text-tertiary)] ring-1 ring-[var(--color-border)]">
                                                {getFileIcon(file)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                            {formatFileSize(file.size)}
                                        </div>

                                        {uploadProgress[index] !==
                                            undefined && (
                                            <div className="mt-2 space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        Uploading...
                                                    </span>
                                                    <span className="font-medium text-[var(--color-primary-600)]">
                                                        {uploadProgress[index]}%
                                                    </span>
                                                </div>
                                                <div className="w-full rounded-full h-1.5 bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-700)] overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] transition-all duration-300"
                                                        style={{
                                                            width: `${uploadProgress[index]}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileRemove(index)}
                                        disabled={disabled || loading}
                                        className={cn(
                                            "p-2 h-auto min-h-0 opacity-0 group-hover:opacity-100 transition-opacity",
                                            "hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400",
                                        )}
                                        aria-label={`${removeText} ${file.name}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    {error && (
                        <div
                            id={`${inputId}-error`}
                            className="text-xs font-medium text-[var(--color-error-500)] flex items-start gap-1.5 animate-in slide-in-from-top-1"
                        >
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>
                                {Array.isArray(error) ? error[0] : error}
                            </span>
                        </div>
                    )}
                    {success && !error && (
                        <div className="text-xs font-medium text-[var(--color-success-600)] dark:text-[var(--color-success-400)] flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {success}
                        </div>
                    )}
                    {warning && !error && !success && (
                        <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {warning}
                        </div>
                    )}
                    {hint && !error && !success && !warning && (
                        <div
                            id={`${inputId}-hint`}
                            className="text-xs text-[var(--color-text-tertiary)] leading-relaxed"
                        >
                            {hint}
                        </div>
                    )}
                </div>
            </div>
        );
    },
);

FileInput.displayName = "FileInput";

export default FileInput;
