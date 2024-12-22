import { S3 } from 'aws-sdk';
import fs from 'fs';
import { convertPath2Posix } from './utils';

const s3 = new S3({
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    endpoint: process.env.CLOUDFLARE_ENDPOINT
})

export async function uploadFile (fileName: string, localFilePath: string) {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: 'clone-vercel',
        Key: convertPath2Posix(fileName)
    }).promise()
    console.log(response);
}