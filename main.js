const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const mongoose = require('mongoose');

const connectMongoDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from MongoDB');
});

let mainWindow;

app.on('ready', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.floor(width / 1.4),
    height: Math.floor(height / 1.3),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080'); // Carrega o servidor de desenvolvimento
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html')); // Carrega o arquivo HTML gerado no modo produção
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      * {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      }
    `);
  });
});

ipcMain.handle('connect-database', async (event, mongoURI) => {
  await connectMongoDB(mongoURI);
});

ipcMain.handle('list-documents', async (event, collectionName) => {
  try {
    const documents = await mongoose.connection.db.collection(collectionName).find({}).toArray();
    const formattedDocuments = documents.map(doc => {
      const { _id, ...rest } = doc;
      return {
        id: _id.toString(),
        ...rest,
      };
    }
    );
    return formattedDocuments;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
});

ipcMain.on('save-data', async (event, data) => {
  const quotes = new Quotes(data);
  await quotes.save();
  console.log('Data saved to MongoDB:', data);
});
