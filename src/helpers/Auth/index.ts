import md5 from "md5";
import jwt from "jsonwebtoken";
import Logger from "@utilities/Logger";
import { IncomingHttpHeaders } from 'http';
import { JWTPayload } from "@datatypes/types";
import { getPublicKey } from "@utilities/Tools";
import { readDocumentsWithQuery } from "@helpers/Firebase";

const { SERVICE_PRIVATE_KEY = "", SERVICE_PRIVATE_KEY_PASSPHRASE = "" } = process.env;

const privateKey = { key: SERVICE_PRIVATE_KEY?.replaceAll('\\n', '\n'), passphrase: SERVICE_PRIVATE_KEY_PASSPHRASE }

const publicKey = getPublicKey(privateKey);

export const generateToken = (payload: any) => jwt.sign(payload, privateKey, { expiresIn: 60 * 60, algorithm: 'RS256', issuer: 'Buni eTIMS', audience: 'BuniFlow TatuPRO' });

export const verifyToken = async (token: string) => {
    try {
        return jwt.verify(token, publicKey, { algorithms: ['RS256'], issuer: 'Buni eTIMS', audience: 'BuniFlow TatuPRO' }) as JWTPayload;
    } catch (error) {
        Logger.error("Error in verifyToken", error);
        if (error instanceof jwt.TokenExpiredError) return jwt.decode(token) as JWTPayload;
        else if (error instanceof jwt.JsonWebTokenError) return null;
        else return null;
    }
}


export const validateAuthorization = async (token: string) => {
    if (token.length <= 32) {
        // Validate API Key
        const admin_passes = await readDocumentsWithQuery('BUNI_ETIMS_USERS', [{ query: 'role', operand: '==', value: 'admin' }]);
        const admin_keys = admin_passes.map(({ password }) => md5(password));
        if (!admin_keys.includes(token)) return { status: false, message: 'Unauthorized' };
        return { status: true, message: 'Authorized' };
    }
    const payload = await verifyToken(token);
    if (!payload) return { status: false, message: 'Unauthorized' };
    else if (payload.exp < Date.now() / 1000) return { status: false, message: 'Token Expired' };
    return { status: true, message: 'Authorized' };
}

export const validateRequestHeaders = async (headers: IncomingHttpHeaders, cmcRequired = true) => {

    const authToken = headers.authorization;
    if (!authToken || !/bearer/gi.test(authToken) || !validateAuthorization(authToken.replaceAll(/bearer| /gi, ''))) return ({ httpStatus: 401, status: false, error: "Unauthorized" });
    const { status: authStatus, message: authMessage } = await validateAuthorization(authToken.replaceAll(/bearer| /gi, ''));

    return ({ httpStatus: authStatus ? 200 : 401, status: authStatus, message: authMessage });

}
