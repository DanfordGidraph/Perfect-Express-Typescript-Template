import md5 from 'md5';
import { takeRight } from 'lodash-es';
import { constants, privateDecrypt, publicEncrypt, createPublicKey } from 'crypto';


export const formatKenyanPhoneNumber = (phoneNumber: number | string) => (phoneNumber ? `254${takeRight(phoneNumber?.toString()?.split(''), 9)?.join('')}` : null);

export const getPublicKey = (PRIVATE_KEY: { key: string, passphrase?: string }) => createPublicKey(PRIVATE_KEY);

export const RSAencryptData = (plaiTextData: Buffer, PRIVATE_KEY: { key: string, passphrase: string }) => publicEncrypt({ ...PRIVATE_KEY, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, plaiTextData);

export const RSAdecryptedData = (encryptedData: Buffer, PRIVATE_KEY: { key: string, passphrase: string }) => privateDecrypt({ ...PRIVATE_KEY, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256", }, encryptedData);

export const getDateFormated = (date: Date, type: string) => {
    const year = date?.getFullYear()
    const month = `0${date.getMonth() + 1}`.slice(-2)
    const day = `0${date.getDate()}`.slice(-2)
    const dateString = date.toLocaleDateString(); // e.g. "12/24/2021"
    const timeString = `${date.toLocaleTimeString().slice(0, 5)}`
    const datetimeString = `${dateString} ${timeString}`
    // reactotron.log('Incoming Date String: ', dateString, 'Time String: ', timeString, 'Datetime String: ', datetimeString)

    switch (type) {
        case 'DATE':
            return dateString
        case 'TIME':
            return timeString
        case 'DATETIME':
            return datetimeString
        default:
            return date.toLocaleString()
    }
}

export const sanitizeString = (username: string) => username?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

export const generateUID = (input: string) => md5(input.toUpperCase());