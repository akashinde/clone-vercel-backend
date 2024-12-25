import express from 'express';
import cors from 'cors';
import simpleGit from 'simple-git';
import path from 'path';

require('dotenv').config();

import { fetchObject, uploadFile } from './aws';
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
    // const _id = generateRandomId();
    const _id = '1734908749226';
    // await simpleGit().clone(repoUrl, path.join(__dirname, `clone_repo_dir/${_id}`));

    const _files = getAllFiles(path.join(__dirname, `clone_repo_dir/${_id}`));

    _files.forEach(async file => {
        await uploadFile(file, path.join(__dirname, file));
    })

    // add to build queue (lPush adds element from left)
    publisher.lPush('build-queue', _id);

    publisher.hSet('status', _id, 'fetch complete');

    res.json({ message: 'clone and upload success', id: _id, totalFiles: _files.length });
})

app.get('/status/:id', async (req, res) => {
    const id = req.params.id;
    const status = await publisher.hGet('status', id);
    res.json({ status });
});

app.get('/rh/*', async (req, res) => {
    const host = req.hostname;
    const filePath = req.path.replace('/rh', '');
    const id = host.split('.')[0];

    console.log(host, filePath, id)

    const content = await fetchObject(id, filePath);    

    const type = filePath.endsWith('.html') ? 'text/html' : filePath.endsWith('.css') ? 'text/css' : 'application/javascript';
    res.set('Content-Type', type);
    res.send(content.Body);
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server running on PORT: ', PORT);
})
