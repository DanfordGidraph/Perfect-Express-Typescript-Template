import Logger from "@utilities/Logger";
import httpRequest from "@utilities/RESTUtils";
import { REST_METHODS } from "@datatypes/enums";
import { enqueueWork } from "@helpers/QueueManager";


const { REMOTE_ENVIRONMENT, REMOTE_SANDBOX_BASE_URL, REMOTE_PRODUCTION_BASE_URL } = process.env;

const REMOTE_SERVICE_BASE_URL = REMOTE_ENVIRONMENT === 'SANDBOX' ? REMOTE_SANDBOX_BASE_URL : REMOTE_PRODUCTION_BASE_URL;

export const relayData = async (doc_path: string, endpoint: string, body: {}, headers: {}) => httpRequest({
    headers,
    extraOptions: {},
    basic_token: null,
    bearer_token: null,
    params: { ...body },
    method: REST_METHODS.POST,
    url: `${REMOTE_SERVICE_BASE_URL}${endpoint}`,
    loggingOpts: { logData: true, logHeaders: false }
})
    .then(async ({ statusCode, body }) => {
        if ([200, 201].includes(statusCode)) {

            return ({ httpStatus: 200, status: true, message: "Relayed successfully", data: body });
        } else {
            enqueueWork({ endpoint: `${REMOTE_SERVICE_BASE_URL}${endpoint}`, doc_path, error_message: body });
            return ({ httpStatus: statusCode, status: false, message: "Error Relaaying the data to remote server", error: body });
        }
    })
    .catch(error => {
        Logger.error("Error RELAYING data to " + REMOTE_SERVICE_BASE_URL, error);
        enqueueWork({ endpoint: `${REMOTE_SERVICE_BASE_URL}${endpoint}`, headers, doc_path, error_message: JSON.stringify(error) });
        return ({ httpStatus: 500, status: false, message: "Error syncing Data with remote ETIMS Server" });
    });

export const retrieveData = async (endpoint: string, body: {}, headers: {}) => httpRequest({
    headers,
    extraOptions: {},
    basic_token: null,
    bearer_token: null,
    params: { ...body },
    method: REST_METHODS.GET,
    url: `${REMOTE_SERVICE_BASE_URL}${endpoint}`,
    loggingOpts: { logData: true, logHeaders: false }
})
    .then(async ({ statusCode, body }) => {
        if ([200, 201].includes(statusCode)) return ({ status: true, message: "Retrieved successfully", data: body });
        throw "UNKOWN Server Error"
    })
    .catch(error => {
        Logger.error("Error RETRIEVING Data from remote Server", error);
        return ({ status: false, error: "Error RETRIEVING Data from remote Server" });
    });