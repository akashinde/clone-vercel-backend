import express from 'express';
import cors from 'cors';
import simpleGit from 'simple-git';
import path from 'path';

require('dotenv').config();

import { uploadFile } from './aws';
import { generateRandomId, getAllFiles } from './utils';

import { createClient } from "redis";
const publisher = createClient();
publisher.connect();

const app = express();
app.use(cors());
// explicitely telling express  to use json for request body
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Release Version 0.1');
})

app.post('/upload', async (req, res) => {
    const repoUrl = req.body.repoUrl;

    // clone the repo
    const _id = generateRandomId();
    await simpleGit().clone(repoUrl, path.join(__dirname, `clone_repo_dir/${_id}`));

    const _files = getAllFiles(path.join(__dirname, `clone_repo_dir/${_id}`));

    _files.forEach(async file => {
        await uploadFile(file, path.join(__dirname, file));
    })

    // add to build queue (lPush adds element from left)
    publisher.lPush('build-queue', _id);

    res.json({ message: 'clone and upload success', id: _id, totalFiles: _files.length });
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server running on PORT: ', PORT);
})
