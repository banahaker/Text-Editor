"use strict";
const Quill = require('quill');
const { ipcRenderer } = require('electron');
let CurrentPath = "";
const editor = new Quill('.editor', {
    modules: {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['code-block']
        ]
    },
    placeholder: 'Type Something......',
    theme: 'snow'
});
const openBtn = document.getElementById('openFile');
const saveBtn = document.getElementById('save');
const OPENFILE = () => {
    ipcRenderer.send('OPENFILE');
};
const SAVEFILE = () => {
    const content = editor.getText(0);
    console.log(CurrentPath);
    ipcRenderer.send("SAVEFILE", { CurrentPath, content });
};
ipcRenderer.on("GOT DOCUMENT", (_, { path, content }) => {
    CurrentPath = path;
    console.log(CurrentPath);
    editor.setText(content);
});
openBtn?.addEventListener('click', OPENFILE);
saveBtn?.addEventListener('click', SAVEFILE);
