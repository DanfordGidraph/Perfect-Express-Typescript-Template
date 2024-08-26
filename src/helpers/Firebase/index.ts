import path from 'path';
import { existsSync } from 'fs';
import admin from 'firebase-admin';
import { WhereFilterOp } from '@datatypes/types';

const __dirname = import.meta.dirname;
const localCertPath = path.resolve(__dirname + '/secrets/firebase_admin_credentials.json');
const certPath = existsSync(localCertPath) ? localCertPath : '/secrets/firebase_admin_credentials.json';

// Logger.log('info', '\n\ncertPath', { localCertPath, certPath });

admin.initializeApp({
    credential: admin.credential.cert(certPath),
});

export const { firestore: FIRESTORE } = admin;

export const readDocument = async (path: string) => {
    const doc = await FIRESTORE().doc(path).get();
    if (!doc.exists) return null;
    return doc?.data() ?? {};
}

export const readDocuments = async (path: string) => {
    const docs = await FIRESTORE().collection(path).get();
    if (docs.empty) return [];
    return docs.docs.map(doc => doc.data());
}

export const readDocumentsWithQuery = async (path: string, conditions: [{ query: string, operand: WhereFilterOp, value: string }]) => {
    let ref = FIRESTORE().collection(path);
    conditions.forEach(condition => {
        ref = ref.where(condition.query, condition.operand, condition.value) as admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    });
    const docs = await ref.get();
    if (docs.empty) return [];
    return docs.docs.map(doc => doc.data());
}


export const writeDocument = async (path: string, data: {}, merge = true) => {
    await FIRESTORE().doc(path).set(data, { merge });
}