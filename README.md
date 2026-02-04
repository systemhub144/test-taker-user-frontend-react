# Repetition Test Platform

Online testing platform for Jahon Gir Academy with mathematical expression input support.

## 🚀 Features

### ✅ Core Features
- **User Authentication via URL**: `?user_id=123456`
- **Test Code Validation**: Real-time API validation with error handling
- **Two Question Types**:
  - Closed questions (A-F multiple choice)
  - Open questions with Math Input (LaTeX support)
- **Timer System**: Automatic submission when time expires
- **Responsive Design**: Works on mobile, tablet, and desktop

### ✅ User Experience
- **Progress Tracking**: Visual progress bar and question counter
- **Answer Persistence**: Auto-save with localStorage backup
- **Quick Navigation**: Jump to any question
- **Time Warnings**: Visual alerts when time is running low
- **Session Recovery**: Continue where you left off after page reload

### ✅ Error Handling
- **API Error Management**: Beautiful error display for all API failures
- **Network Resilience**: Local backup when offline
- **Form Validation**: Real-time validation with helpful messages
- **Logging**: Comprehensive error logging for debugging

### ✅ Security & Data
- **Data Validation**: Input sanitization and validation
- **Session Management**: Secure user session handling
- **Backup System**: Local storage for answer recovery
- **Clean Data Submission**: Properly formatted API requests

## 📁 Project Structure
src/<br>
├── components/ # Reusable components<br>
│ ├── ErrorDisplay.jsx<br>
│ └── ErrorDisplay.css<br>
├── pages/ # Main application pages<br>
│ ├── TestCodePage.jsx<br>
│ ├── TestCodePage.css<br>
│ ├── UserInfoPage.jsx<br>
│ ├── UserInfoPage.css<br>
│ ├── TestPage.jsx<br>
│ ├── TestPage.css<br>
│ ├── ResultsPage.jsx<br>
│ └── ResultsPage.css<br>
├── App.js # Main application component<br>
├── App.css # Global styles<br>
├── index.js # Application entry point<br>
└── index.css # Base styles<br>


## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+
- npm 8+

### Installation
```bash
# Clone repository
git clone https://github.com/jahongirakademi/repetition-test-frontend.git

# Navigate to project
cd repetition-test-frontend

# Install dependencies
npm install
