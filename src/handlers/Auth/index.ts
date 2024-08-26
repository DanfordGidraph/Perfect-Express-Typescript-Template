import express, { NextFunction } from "express";
import Logger from "@utilities/Logger";
import { readDocument } from "@helpers/Firebase";
import { generateToken, verifyToken } from "@helpers/Auth";
import { generateUID, RSAdecryptedData, sanitizeString } from "@utilities/Tools";
import { DBUser } from "@datatypes/types";


// logIn:
/**
 * This function should return a JWT token for the user if the username and password are correct.
 *
 * @param req: express.Request
 * @param res: express.Response
 * @param next: NextFunction
 * @return Promise<express.Response>
 */
export const logIn = async (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
        const { username, password }: { username: string, password: string } = req?.body ?? {};
        if (!username || !password) return res.status(400).json({ error: "Invalid request body" });
        const uid = generateUID(sanitizeString(username));

        const { SERVICE_PRIVATE_KEY, SERVICE_PRIVATE_KEY_PASSPHRASE, USERS_COLLECTION } = process.env;
        let { username: user_name, password: user_password, role: user_role, } = await readDocument(`${USERS_COLLECTION}/${uid}`) ?? {} as DBUser;
        if (!user_name || !user_password) return res.status(403).json({ error: "Invalid username or password" });

        const decryptedUserPass = RSAdecryptedData(Buffer.from(user_password, 'base64'), { key: SERVICE_PRIVATE_KEY.replaceAll('\\n', '\n'), passphrase: SERVICE_PRIVATE_KEY_PASSPHRASE }).toString('utf-8');
        if (decryptedUserPass !== password) return res.status(403).json({ error: "Invalid username or password" });

        const tokenPayload = { username: user_name, role: user_role, uid: uid };
        const token = generateToken(tokenPayload);

        return res.status(200).json({ message: "Authenticated", status: true, token });
    } catch (error) {
        // Log the error and call the next function with the error
        Logger.error("An error occurred in the LogIn function", error);
        next(error);
    }
};

// refreshToken:
/**
 * This function should return a new JWT token for the user if the refresh token is correct.
 *
 * @param req: express.Request
 * @param res: express.Response
 * @param next: NextFunction
 * @return Promise<express.Response>
 */
export const refreshToken = async (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
        const { refreshToken }: { refreshToken: string } = req?.body
        if (!refreshToken) return res.status(400).json({ error: "Invalid request body" });
        // Check if the refresh token is valid
        const validToken = await verifyToken(refreshToken);
        // Logger.info("Valid Token: ", validToken);
        // If the refresh token is not valid, return an error message
        if (!validToken) return res.status(403).json({ error: "Invalid token" });
        // If the refresh token is valid, return a new JWT token
        const tokenPayload = { username: validToken?.username, role: validToken?.role, uid: validToken?.uid };
        return res.status(200).json({ message: "Authenticated", status: true, token: generateToken(tokenPayload) });

    } catch (error) {
        // Log the error and call the next function with the error
        Logger.error("An error occurred in the getStockMovement function", error);
        next(error);
    }
}

