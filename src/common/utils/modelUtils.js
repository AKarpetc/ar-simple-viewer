import conf from "../../config/config.js"
import { GUID } from "../guid.js"
import { s3Client } from '../../s3/s3Client.js'
import { ListObjectsV2Command, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from 'buffer';

export async function updateModel(id, armessage, message) {
    const body = {
        id: id,
        armessage: armessage,
        message: message
    }
    const command = new PutObjectCommand({
        Bucket: "avt-content",
        Key: `${conf.idsFolder}/${body.id}.json`,
        Body: JSON.stringify(body),
    });

    try {
        const response = await s3Client.send(command);
        return body;
    } catch (err) {
        console.error(err);
    }
}

export async function generateModel(armessage, message) {
    const body = {
        id: GUID(),
        armessage: armessage,
        message: message
    }
    const command = new PutObjectCommand({
        Bucket: "avt-content",
        Key: `${conf.idsFolder}/${body.id}.json`,
        Body: JSON.stringify(body),
    });

    try {
        const response = await s3Client.send(command);
        return body;
    } catch (err) {
        console.error(err);
    }
}

export async function saveMainItems(body) {

    const command = new PutObjectCommand({
        Bucket: "avt-content",
        Key: `${conf.idsFolder}/${body.id}.json`,
        Body: JSON.stringify(body),
    });

    try {
        const response = await s3Client.send(command);
        return body;
    } catch (err) {
        console.error(err);
    }
}

export async function getObjectByGUID(guid) {
    try {
        const command = new GetObjectCommand({
            Bucket: "avt-content",
            Key: `${conf.idsFolder}/${guid}.json`
        });
        const response = await s3Client.send(command);
        const bodyContents = await streamToString(response.Body);
        return JSON.parse(bodyContents);
    } catch (error) {
        return null;
    }
}

export async function fetchAndFilter(targetArmMessage, targetMessage) {
    try {
        for (const guid of await getAllModels()) {
            try {
                const objectData = await getObjectByGUID(guid);

                if (objectData.armessage === targetArmMessage && objectData.message === targetMessage) {
                    return objectData;
                }
            } catch (error) {
                console.error(`Failed to retrieve and filter object with GUID: ${guid}`, error);
            }
        }

        console.log("No matching object found");
        return null;
    } catch (error) {
        console.error("Error listing objects:", error);
        throw error;
    }
}

export async function getAllModels() {
    const command = new ListObjectsV2Command({
        Bucket: "avt-content",
        Prefix: conf.idsFolder
    });

    try {
        const response = await s3Client.send(command);
        const guids = response.Contents.map(item => item.Key.replace(`${conf.idsFolder}/`, '').replace('.json', ''));
        return guids;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getOrCreate(armessage, message) {
    const foundModel = await fetchAndFilter(armessage, message);

    const model = foundModel ? foundModel : await generateModel(armessage, message);
    
    return model;
}

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

export default {
    generateModel,
    getAllModels,
    fetchAndFilter,
    getObjectByGUID,
    getOrCreate,
    saveMainItems,
    updateModel
};