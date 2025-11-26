import { useState, useEffect } from 'react'
import './App.css'

const STORAGE_KEYS = {
    targetUrl: 'fileUpload_targetUrl',
    authMethod: 'fileUpload_authMethod',
    authValue: 'fileUpload_authValue',
    username: 'fileUpload_username',
    password: 'fileUpload_password',
    customHeaders: 'fileUpload_customHeaders',
    httpMethod: 'fileUpload_httpMethod',
    contentTypeOverrides: 'fileUpload_contentTypeOverrides',
    selectedFileNames: 'fileUpload_selectedFileNames'
}

function App() {
    // Load initial values from localStorage
    const loadFromStorage = (key, defaultValue) => {
        try {
            const item = localStorage.getItem(key)
            if (item === null) return defaultValue
            return JSON.parse(item)
        } catch {
            return defaultValue
        }
    }

    const [targetUrl, setTargetUrl] = useState(() => loadFromStorage(STORAGE_KEYS.targetUrl, ''))
    const [selectedFiles, setSelectedFiles] = useState([])
    const [authMethod, setAuthMethod] = useState(() => loadFromStorage(STORAGE_KEYS.authMethod, 'BEARER'))
    const [authValue, setAuthValue] = useState(() => loadFromStorage(STORAGE_KEYS.authValue, ''))
    const [username, setUsername] = useState(() => loadFromStorage(STORAGE_KEYS.username, ''))
    const [password, setPassword] = useState(() => loadFromStorage(STORAGE_KEYS.password, ''))
    const [customHeaders, setCustomHeaders] = useState(() => {
        const loaded = loadFromStorage(STORAGE_KEYS.customHeaders, [{ key: '', value: '' }])
        // Ensure at least one header row exists
        return Array.isArray(loaded) && loaded.length > 0 ? loaded : [{ key: '', value: '' }]
    })
    const [httpMethod, setHttpMethod] = useState(() => loadFromStorage(STORAGE_KEYS.httpMethod, 'POST'))
    const [contentTypeOverrides, setContentTypeOverrides] = useState(() => loadFromStorage(STORAGE_KEYS.contentTypeOverrides, {}))
    const [response, setResponse] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [headersExpanded, setHeadersExpanded] = useState(true)
    const [bodyExpanded, setBodyExpanded] = useState(true)
    const [showSampleTester, setShowSampleTester] = useState(false)
    const [sampleJsonInput, setSampleJsonInput] = useState('')
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '')

    // Save to localStorage whenever values change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.targetUrl, JSON.stringify(targetUrl))
    }, [targetUrl])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.authMethod, JSON.stringify(authMethod))
    }, [authMethod])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.authValue, JSON.stringify(authValue))
    }, [authValue])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.username, JSON.stringify(username))
    }, [username])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.password, JSON.stringify(password))
    }, [password])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.customHeaders, JSON.stringify(customHeaders))
    }, [customHeaders])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.httpMethod, JSON.stringify(httpMethod))
    }, [httpMethod])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.contentTypeOverrides, JSON.stringify(contentTypeOverrides))
    }, [contentTypeOverrides])

    // Save file names when files are selected (can't save File objects)
    useEffect(() => {
        if (selectedFiles.length > 0) {
            const fileNames = selectedFiles.map(file => file.name)
            localStorage.setItem(STORAGE_KEYS.selectedFileNames, JSON.stringify(fileNames))
        }
    }, [selectedFiles])

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

    // Load saved file names on mount (informational only - user needs to reselect)
    useEffect(() => {
        const savedFileNames = loadFromStorage(STORAGE_KEYS.selectedFileNames, [])
        if (savedFileNames.length > 0) {
            // Note: We can't restore the actual File objects, but we can show what was selected
            // The user will need to reselect files, but we preserve the content-type overrides
        }
    }, [])

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

    const colorizeJson = (jsonString) => {
        const parts = []
        let index = 0
        let key = 0

        while (index < jsonString.length) {
            const char = jsonString[index]

            // Match keys (quoted string followed by colon)
            const keyMatch = jsonString.substring(index).match(/^"(?:[^"\\]|\\.)*":\s*/)
            if (keyMatch) {
                parts.push(
                    <span key={`key-${key++}`} className="json-key">{keyMatch[0].trimEnd()}</span>
                )
                if (keyMatch[0].length !== keyMatch[0].trimEnd().length) {
                    parts.push(' ')
                }
                index += keyMatch[0].length
                continue
            }

            // Match string values (quoted string not followed by colon)
            const stringMatch = jsonString.substring(index).match(/^"(?:[^"\\]|\\.)*"/)
            if (stringMatch) {
                parts.push(
                    <span key={`str-${key++}`} className="json-string">{stringMatch[0]}</span>
                )
                index += stringMatch[0].length
                continue
            }

            // Match numbers
            const numberMatch = jsonString.substring(index).match(/^-?\d+\.?\d*/)
            if (numberMatch) {
                parts.push(
                    <span key={`num-${key++}`} className="json-number">{numberMatch[0]}</span>
                )
                index += numberMatch[0].length
                continue
            }

            // Match booleans
            if (jsonString.substring(index).startsWith('true')) {
                parts.push(<span key={`bool-${key++}`} className="json-boolean">true</span>)
                index += 4
                continue
            }
            if (jsonString.substring(index).startsWith('false')) {
                parts.push(<span key={`bool-${key++}`} className="json-boolean">false</span>)
                index += 5
                continue
            }

            // Match null
            if (jsonString.substring(index).startsWith('null')) {
                parts.push(<span key={`null-${key++}`} className="json-null">null</span>)
                index += 4
                continue
            }

            // Match brackets
            if (char === '[' || char === ']' || char === '{' || char === '}') {
                parts.push(<span key={`bracket-${key++}`} className="json-bracket">{char}</span>)
                index++
                continue
            }

            // Match colon
            if (char === ':') {
                parts.push(<span key={`colon-${key++}`} className="json-colon">{char}</span>)
                index++
                continue
            }

            // Match comma
            if (char === ',') {
                parts.push(<span key={`comma-${key++}`} className="json-comma">{char}</span>)
                index++
                continue
            }

            // Default: add character as-is
            parts.push(char)
            index++
        }

        return parts
    }

    const renderResponseData = (data) => {
        let parsedData
        try {
            if (typeof data === 'string') {
                parsedData = JSON.parse(data)
            } else {
                parsedData = data
            }
        } catch {
            // Not JSON, render as plain text
            return <pre className="response-content response-text">{String(data)}</pre>
        }

        const jsonString = JSON.stringify(parsedData, null, 2)
        return (
            <pre className="response-content response-json">{colorizeJson(jsonString)}</pre>
        )
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
        setHeadersExpanded(true)
        setBodyExpanded(true)

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
                    {isLocalhost && (
                        <button
                            type="button"
                            onClick={() => setShowSampleTester(!showSampleTester)}
                            className="btn btn-secondary"
                            style={{ marginLeft: '10px' }}
                        >
                            {showSampleTester ? 'Hide' : 'Show'} Sample Response Tester
                        </button>
                    )}
                </div>

                {isLocalhost && showSampleTester && (
                    <div className="sample-tester-section">
                        <h3>Sample Response Tester</h3>
                        <p className="sample-tester-description">
                            Test the JSON renderer with sample data. Paste JSON below or use a predefined sample.
                        </p>

                        <div className="form-section">
                            <label>
                                Sample JSON Response
                                <textarea
                                    value={sampleJsonInput}
                                    onChange={(e) => setSampleJsonInput(e.target.value)}
                                    placeholder='Paste JSON here, e.g., {"status": "success", "data": {"id": 123, "name": "test"}}'
                                    className="input-field sample-json-input"
                                    rows={8}
                                />
                            </label>
                        </div>

                        <div className="form-section">
                            <label>Quick Samples:</label>
                            <div className="sample-buttons">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sample = {
                                            status: 'success',
                                            message: 'File uploaded successfully',
                                            data: {
                                                id: 12345,
                                                filename: 'example.jpg',
                                                size: 1024000,
                                                uploadedAt: '2024-01-15T10:30:00Z'
                                            },
                                            metadata: {
                                                contentType: 'image/jpeg',
                                                checksum: 'abc123def456'
                                            }
                                        }
                                        setSampleJsonInput(JSON.stringify(sample, null, 2))
                                    }}
                                    className="btn btn-secondary btn-small"
                                >
                                    Simple Object
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sample = {
                                            users: [
                                                { id: 1, name: 'Alice', email: 'alice@example.com', roles: ['admin', 'user'] },
                                                { id: 2, name: 'Bob', email: 'bob@example.com', roles: ['user'] },
                                                { id: 3, name: 'Charlie', email: 'charlie@example.com', roles: ['guest'] }
                                            ],
                                            pagination: {
                                                page: 1,
                                                perPage: 10,
                                                total: 3
                                            }
                                        }
                                        setSampleJsonInput(JSON.stringify(sample, null, 2))
                                    }}
                                    className="btn btn-secondary btn-small"
                                >
                                    Array with Objects
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sample = {
                                            error: {
                                                code: 400,
                                                message: 'Validation failed',
                                                details: [
                                                    { field: 'email', message: 'Invalid email format' },
                                                    { field: 'password', message: 'Password must be at least 8 characters' }
                                                ],
                                                timestamp: '2024-01-15T10:30:00Z'
                                            }
                                        }
                                        setSampleJsonInput(JSON.stringify(sample, null, 2))
                                    }}
                                    className="btn btn-secondary btn-small"
                                >
                                    Error Response
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sample = {
                                            nested: {
                                                level1: {
                                                    level2: {
                                                        level3: {
                                                            level4: {
                                                                deep: 'Very nested data',
                                                                array: [1, 2, { nested: 'in array' }, [3, 4]]
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            mixed: {
                                                strings: ['a', 'b', 'c'],
                                                numbers: [1, 2, 3],
                                                booleans: [true, false],
                                                nulls: [null, null]
                                            }
                                        }
                                        setSampleJsonInput(JSON.stringify(sample, null, 2))
                                    }}
                                    className="btn btn-secondary btn-small"
                                >
                                    Deeply Nested
                                </button>
                            </div>
                        </div>

                        <div className="form-section">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!sampleJsonInput.trim()) {
                                        setError('Please enter or select a sample JSON response')
                                        return
                                    }
                                    try {
                                        const parsed = JSON.parse(sampleJsonInput)
                                        setError(null)
                                        setResponse({
                                            status: 200,
                                            statusText: 'OK',
                                            headers: {
                                                'content-type': 'application/json',
                                                'content-length': String(sampleJsonInput.length)
                                            },
                                            data: parsed,
                                            file: 'sample.json'
                                        })
                                        setHeadersExpanded(true)
                                        setBodyExpanded(true)
                                    } catch (err) {
                                        setError(`Invalid JSON: ${err.message}`)
                                    }
                                }}
                                className="btn btn-primary"
                            >
                                Load Sample Response
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSampleJsonInput('')
                                    setResponse(null)
                                    setError(null)
                                }}
                                className="btn btn-secondary"
                                style={{ marginLeft: '10px' }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

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
                                <strong>Status:</strong>{' '}
                                <span className={`status-code status-${Math.floor(response.status / 100)}xx`}>
                                    {response.status}
                                </span>{' '}
                                {response.statusText}
                            </div>
                            <div className="response-file">
                                <strong>File:</strong> {response.file}
                            </div>
                        </div>
                        <div className="response-headers">
                            <div
                                className="response-section-header"
                                onClick={() => setHeadersExpanded(!headersExpanded)}
                            >
                                <span className="section-toggle">{headersExpanded ? '▼' : '▶'}</span>
                                <strong>Headers</strong>
                            </div>
                            {headersExpanded && (
                                <div className="response-headers-content">
                                    {renderResponseData(response.headers)}
                                </div>
                            )}
                        </div>
                        <div className="response-body">
                            <div
                                className="response-section-header"
                                onClick={() => setBodyExpanded(!bodyExpanded)}
                            >
                                <span className="section-toggle">{bodyExpanded ? '▼' : '▶'}</span>
                                <strong>Response Body</strong>
                            </div>
                            {bodyExpanded && (
                                <div className="response-body-content">
                                    {renderResponseData(response.data)}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App

