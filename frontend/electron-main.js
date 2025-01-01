const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let pythonProcess = null;

function log(message) {
  const logPath = path.join(app.getPath('userData'), 'app.log');
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  fs.appendFileSync(logPath, logMessage);
  console.log(message);
}

function createBatchScript() {
  const batchPath = path.join(app.getPath('temp'), 'start_python.bat');
  const pythonExecutable = path.join(process.resourcesPath, 'backend', 'python', 'python.exe');
  const pythonScript = path.join(process.resourcesPath, 'backend', 'server.py');

  const batchContent = `
@echo off
"${pythonExecutable}" "${pythonScript}"
if errorlevel 1 (
  exit /b 1
)
`;

  fs.writeFileSync(batchPath, batchContent);
  return batchPath;
}

function startPythonProcess() {
  try {
    if (process.env.NODE_ENV === 'development') {
      pythonProcess = spawn('python', [path.join(__dirname, '..', 'backend', 'server.py')], {
        stdio: 'inherit',
        detached: false,
        windowsHide: true
      });
    } else {
      const batchPath = createBatchScript();
      log(`Created batch script at: ${batchPath}`);

      // Run the batch script completely hidden
      pythonProcess = spawn(batchPath, [], {
        shell: true,
        detached: false,
        windowsHide: true,
        stdio: 'ignore'
      });
    }

    pythonProcess.on('error', (err) => {
      log(`Failed to start Python process: ${err.message}`);
    });

    pythonProcess.on('exit', (code, signal) => {
      log(`Python process exited with code ${code} and signal ${signal}`);
    });

  } catch (error) {
    log(`Error in startPythonProcess: ${error.message}`);
    throw error;
  }
}

function createWindow() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'logo1.png'));
  try {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      frame: true,
      autoHideMenuBar: true,
      icon: icon,
      title: 'Paint Store'
    });

    if (process.platform === 'win32') {
      mainWindow.setIcon(icon);
    }

    // Remove application menu completely
    mainWindow.removeMenu();

    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:3000');
    } else {
      mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  } catch (error) {
    log(`Error in createWindow: ${error.message}`);
    throw error;
  }
}

app.whenReady().then(async () => {
  try {
    startPythonProcess();

    setTimeout(() => {
      createWindow();
    }, 2000);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    log(`Error in app.whenReady: ${error.message}`);
  }
});

app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('SIGTERM', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  app.quit();
});

process.on('SIGINT', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  app.quit();
});