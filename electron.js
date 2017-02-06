'use strict';
const electron = require('electron');
// Module to control application life.
const {app, Menu, BrowserWindow} = electron;
// Create the menu of application
/*
const template = [
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' }]
    },
    {
        label: 'View', submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload()
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                }
            },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    {
        role: 'window',
        submenu: [
            { role: 'minimize' },
            { role: 'close' }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click() { require('electron').shell.openExternal('http://electron.atom.io') }
            }
        ]
    }
]
if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services', submenu: [] },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    })
    // Edit menu.
    template[1].submenu.push(
        { type: 'separator' },
        {
            label: 'Speech', submenu: [
                { role: 'startspeaking' },
                { role: 'stopspeaking' }
            ]
        }
    )
    // Window menu.
    template[3].submenu = [
        {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        },
        {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },
        {
            label: 'Zoom',
            role: 'zoom'
        },
        { type: 'separator' },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    ]
}
const menuApp = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menuApp)
*/

// Module to create native browser window.
let win;
let myNotification;
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 600, title: "Poc Client" });
    var url = 'http://localhost:8000';
    var Args = process.argv.slice(2);
    Args.forEach(function (val) {
        if (val === "dist") {
            url = 'file://' + __dirname + '/www/index.html?ionicMode=ios'
        }
    });
    //win.setMenu(menuApp);
    // and load the index.html of the app.
    win.loadURL(url);
    const ses = win.webContents.session
    console.log(ses.getUserAgent())


    // Open the DevTools.
    //win.webContents.openDevTools();
    win.on('app-command', (e, cmd) => {
        // Navigate the window back when the user hits their mouse back button
        console.log("New command", cmd);
        if (cmd === 'browser-backward' && win.webContents.canGoBack()) {
            win.webContents.goBack()
        }
    })

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    let contents = win.webContents
    contents.on('new-window', function (event, urlExt) {
        console.log(event, url);
    });
}

function createNotif() {
    myNotification = new Notification('Title', {
        body: 'Application Opérationnelle.'
    })
    myNotification.onclick = () => {
        console.log('Notification clicked')
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
        //createNotif();
        openLink();
    }
});