import { useState } from 'react'
import './App.css'

function App() {
    const [targetUrl, setTargetUrl] = useState('')
    const [selectedFiles, setSelectedFiles] = useState([])
    const [authMethod, setAuthMethod] = useState('BEARER')
    const [authValue, setAuthValue] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [customHeaders, setCustomHeaders] = useState([{ key: '', value: '' }])
    const [httpMethod, setHttpMethod] = useState('POST')
    const [contentTypeOverrides, setContentTypeOverrides] = useState({})
    const [response, setResponse] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // MIME type mapping based on file extensions
    const getMimeType = (filename) => {
        const extension = filename.split('.').pop()?.toLowerCase() || ''
        const mimeTypes = {
            // Images
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'bmp': 'image/bmp',
            'ico': 'image/x-icon',
            // Documents
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            // Text
            'txt': 'text/plain',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'text/javascript',
            'json': 'application/json',
            'xml': 'application/xml',
            'csv': 'text/csv',
            // Archives
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
            'tar': 'application/x-tar',
            'gz': 'application/gzip',
            // Audio
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'm4a': 'audio/mp4',
            // Video
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            // Other
            'bin': 'application/octet-stream',
            'exe': 'application/x-msdownload',
        }
        return mimeTypes[extension] || 'application/octet-stream'
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        setSelectedFiles(files)

        // Initialize content type overrides for new files
        const newOverrides = { ...contentTypeOverrides }
        files.forEach(file => {
            if (!newOverrides[file.name]) {
                newOverrides[file.name] = getMimeType(file.name)
            }
        })
        setContentTypeOverrides(newOverrides)
    }

    const handleContentTypeChange = (filename, value) => {
        setContentTypeOverrides(prev => ({
            ...prev,
            [filename]: value
        }))
    }

    const addCustomHeader = () => {
        setCustomHeaders([...customHeaders, { key: '', value: '' }])
    }

    const removeCustomHeader = (index) => {
        setCustomHeaders(customHeaders.filter((_, i) => i !== index))
    }

    const updateCustomHeader = (index, field, value) => {
        const updated = [...customHeaders]
        updated[index][field] = value
        setCustomHeaders(updated)
    }

    const formatResponse = (data) => {
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data)
                return JSON.stringify(parsed, null, 2)
            } catch {
                return data
            }
        }
        if (typeof data === 'object') {
            return JSON.stringify(data, null, 2)
        }
        return String(data)
    }

    const handleUpload = async () => {
        if (!targetUrl) {
            setError('Please specify a target URL')
            return
        }

        if (selectedFiles.length === 0) {
            setError('Please select at least one file')
            return
        }

        setLoading(true)
        setError(null)
        setResponse(null)

        try {
            for (const file of selectedFiles) {
                const headers = {}

                // Add authentication header
                if (authMethod === 'BEARER' && authValue) {
                    headers['Authorization'] = `Bearer ${authValue}`
                } else if (authMethod === 'BASIC' && authValue) {
                    headers['Authorization'] = `Basic ${authValue}`
                } else if (authMethod === 'BASIC_CREDENTIALS' && username && password) {
                    const credentials = btoa(`${username}:${password}`)
                    headers['Authorization'] = `Basic ${credentials}`
                }

                // Add custom headers
                customHeaders.forEach(header => {
                    if (header.key && header.value) {
                        headers[header.key] = header.value
                    }
                })

                // Set content type
                const contentType = contentTypeOverrides[file.name] || getMimeType(file.name)
                headers['Content-Type'] = contentType

                // Send file as Blob to allow full control over Content-Type
                const fileBlob = file

                const options = {
                    method: httpMethod,
                    headers: headers,
                    body: httpMethod === 'GET' ? null : fileBlob
                }

                const fetchResponse = await fetch(targetUrl, options)

                let responseData
                const contentTypeHeader = fetchResponse.headers.get('content-type')
                if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
                    responseData = await fetchResponse.json()
                } else {
                    responseData = await fetchResponse.text()
                }

                setResponse({
                    status: fetchResponse.status,
                    statusText: fetchResponse.statusText,
                    headers: Object.fromEntries(fetchResponse.headers.entries()),
                    data: responseData,
                    file: file.name
                })
            }
        } catch (err) {
            setError(err.message || 'Upload failed')
            setResponse(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app">
            <div className="container">
                <h1>File Upload Tool</h1>

                <div className="form-section">
                    <label>
                        Target URL <span className="required">*</span>
                        <input
                            type="url"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://example.com/upload"
                            className="input-field"
                        />
                    </label>
                </div>

                <div className="form-section">
                    <label>
                        HTTP Method
                        <select
                            value={httpMethod}
                            onChange={(e) => setHttpMethod(e.target.value)}
                            className="input-field"
                        >
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="PATCH">PATCH</option>
                            <option value="GET">GET</option>
                        </select>
                    </label>
                </div>

                <div className="form-section">
                    <label>
                        Select Files <span className="required">*</span>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="input-field file-input"
                        />
                    </label>
                    {selectedFiles.length > 0 && (
                        <div className="file-list">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="file-item">
                                    <div className="file-info">
                                        <strong>{file.name}</strong>
                                        <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                                    </div>
                                    <div className="content-type-control">
                                        <label>
                                            Content-Type:
                                            <input
                                                type="text"
                                                value={contentTypeOverrides[file.name] || getMimeType(file.name)}
                                                onChange={(e) => handleContentTypeChange(file.name, e.target.value)}
                                                className="input-field content-type-input"
                                                placeholder="application/octet-stream"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleContentTypeChange(file.name, getMimeType(file.name))}
                                            className="btn btn-secondary btn-small"
                                        >
                                            Reset to Auto
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <label>
                        Authentication Method
                        <select
                            value={authMethod}
                            onChange={(e) => setAuthMethod(e.target.value)}
                            className="input-field"
                        >
                            <option value="BEARER">Bearer Token</option>
                            <option value="BASIC">Basic Auth</option>
                            <option value="BASIC_CREDENTIALS">Basic with Credentials</option>
                        </select>
                    </label>
                </div>

                {authMethod === 'BASIC_CREDENTIALS' ? (
                    <>
                        <div className="form-section">
                            <label>
                                Username
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="input-field"
                                />
                            </label>
                        </div>
                        <div className="form-section">
                            <label>
                                Password
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="input-field"
                                />
                            </label>
                        </div>
                    </>
                ) : (
                    <div className="form-section">
                        <label>
                            Authentication Value
                            <input
                                type="text"
                                value={authValue}
                                onChange={(e) => setAuthValue(e.target.value)}
                                placeholder={authMethod === 'BEARER' ? 'Your bearer token' : 'Base64 encoded credentials'}
                                className="input-field"
                            />
                        </label>
                    </div>
                )}

                <div className="form-section">
                    <label>
                        Custom Headers
                        <button
                            type="button"
                            onClick={addCustomHeader}
                            className="btn btn-secondary btn-small"
                        >
                            + Add Header
                        </button>
                    </label>
                    {customHeaders.map((header, index) => (
                        <div key={index} className="header-row">
                            <input
                                type="text"
                                value={header.key}
                                onChange={(e) => updateCustomHeader(index, 'key', e.target.value)}
                                placeholder="Header name"
                                className="input-field header-input"
                            />
                            <input
                                type="text"
                                value={header.value}
                                onChange={(e) => updateCustomHeader(index, 'value', e.target.value)}
                                placeholder="Header value"
                                className="input-field header-input"
                            />
                            {customHeaders.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeCustomHeader(index)}
                                    className="btn btn-danger btn-small"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="form-section">
                    <button
                        onClick={handleUpload}
                        disabled={loading || !targetUrl || selectedFiles.length === 0}
                        className="btn btn-primary"
                    >
                        {loading ? 'Uploading...' : 'Upload Files'}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {response && (
                    <div className="response-section">
                        <h2>Server Response</h2>
                        <div className="response-info">
                            <div className="response-status">
                                <strong>Status:</strong> {response.status} {response.statusText}
                            </div>
                            <div className="response-file">
                                <strong>File:</strong> {response.file}
                            </div>
                        </div>
                        <div className="response-headers">
                            <strong>Headers:</strong>
                            <pre>{JSON.stringify(response.headers, null, 2)}</pre>
                        </div>
                        <div className="response-body">
                            <strong>Response Body:</strong>
                            <pre className="response-content">{formatResponse(response.data)}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App

