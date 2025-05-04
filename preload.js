const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fetchData: () => ipcRenderer.invoke('fetch-data'),
  saveData: (data) => ipcRenderer.send('save-data', data),
  listDocuments: (collectionName) => ipcRenderer.invoke('list-documents', collectionName),
  connectDatabase: (mongoURI) => ipcRenderer.invoke('connect-database', mongoURI),
});