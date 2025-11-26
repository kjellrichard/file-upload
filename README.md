# File Upload Tool

A modern, feature-rich web application for uploading files to remote servers with advanced authentication and customization options. Built with React and Vite.

## Features

- **Multiple File Upload**: Select and upload multiple files simultaneously
- **Flexible Authentication**:
  - Bearer Token authentication
  - Basic Auth with base64-encoded credentials
  - Basic Auth with username/password (automatically encoded)
- **Custom Headers**: Add multiple custom HTTP headers to requests
- **HTTP Method Selection**: Choose between POST, PUT, PATCH, or GET methods
- **Automatic Content-Type Detection**: Automatically detects MIME types based on file extensions (supports 50+ file types)
- **Content-Type Override**: Manually override Content-Type headers with auto-detection as default
- **Formatted Response Display**: View server responses with formatted JSON, status codes, and headers
- **Modern UI**: Clean, responsive interface with error handling and loading states

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd file-upload
```

2. Install dependencies:
```bash
npm install
```

## Development

### Start Development Server

Run the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Usage

### Basic File Upload

1. **Enter Target URL**: Specify the server endpoint where files should be uploaded (e.g., `https://api.example.com/upload`)

2. **Select Files**: Click "Select Files" and choose one or more files from your computer

3. **Configure Upload Settings** (optional):
   - Choose HTTP method (default: POST)
   - Set authentication if required
   - Add custom headers if needed
   - Adjust Content-Type if necessary

4. **Upload**: Click "Upload Files" to send the files to the server

### Authentication Methods

#### Bearer Token
- Select "Bearer Token" from the authentication method dropdown
- Enter your bearer token in the "Authentication Value" field

#### Basic Auth (Base64 Encoded)
- Select "Basic Auth" from the authentication method dropdown
- Enter your base64-encoded credentials in the "Authentication Value" field
- Format: Base64 encoded `username:password`

#### Basic with Credentials
- Select "Basic with Credentials" from the authentication method dropdown
- Enter your username and password in the separate fields
- The tool will automatically base64-encode the credentials

### Custom Headers

Add custom HTTP headers to your requests:

1. Click "+ Add Header" button
2. Enter the header name (e.g., `X-Custom-Header`)
3. Enter the header value
4. Add multiple headers as needed
5. Remove headers using the "Remove" button

### Content-Type Management

- **Automatic Detection**: Content-Type is automatically detected based on file extension
- **Manual Override**: Edit the Content-Type field to use a custom MIME type
- **Reset to Auto**: Click "Reset to Auto" to restore automatic detection

### Viewing Responses

After uploading, the server response is displayed with:
- HTTP status code and status text
- Response headers (formatted JSON)
- Response body (formatted JSON when applicable)
- File name that was uploaded

## Supported File Types

The tool automatically detects Content-Type for common file types including:

- **Images**: JPG, PNG, GIF, WebP, SVG, BMP, ICO
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Text**: TXT, HTML, CSS, JS, JSON, XML, CSV
- **Archives**: ZIP, RAR, 7Z, TAR, GZ
- **Audio**: MP3, WAV, OGG, M4A
- **Video**: MP4, WebM, AVI, MOV
- **Other**: BIN, EXE, and more

## Project Structure

```
file-upload/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Project dependencies
└── README.md           # This file
```

## Technologies Used

- **React 18**: UI library
- **Vite**: Build tool and development server
- **Modern JavaScript**: ES6+ features

## License

See LICENSE file for details.

