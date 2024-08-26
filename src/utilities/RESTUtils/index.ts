import AxiosLogger from "axios-logger";
import { CookieJar } from 'tough-cookie';
import Logger from "../Logger";
import axios, { AxiosError } from "axios";
import { wrapper } from 'axios-cookiejar-support';
import { RESTRequest } from "@datatypes/types";
import { REST_METHODS } from "@datatypes/enums";

const httpRequest = async (request: RESTRequest) => {
    const { url, method, headers, params, basic_token, bearer_token, extraOptions = {}, loggingOpts } = request;
    AxiosLogger.setGlobalConfig({
        url: true,
        method: true,
        status: true,
        dateFormat: "HH:MM:ss",
        prefixText: "Axios Logger",
        data: loggingOpts.logData ?? true,
        headers: loggingOpts.logHeaders ?? true,
        logger: (logText) => Logger.info(logText),
    });
    const axiosInstance = wrapper(axios.create({ jar: new CookieJar() }))
    axiosInstance.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
    axiosInstance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);

    const options = { method, url, headers: { Authorization: "" }, timeout: 30000, ...extraOptions };
    if (headers) options.headers = { ...options.headers, ...headers };
    if (basic_token) options.headers.Authorization = `Basic ${basic_token}`;
    if (bearer_token) options.headers.Authorization = `Bearer ${bearer_token}`;
    if (params) options[method === REST_METHODS.GET ? "params" : "data"] = params;

    return axiosInstance.request(options)
        .then((response) => ({ statusCode: response.status, body: response.data, headers: response.headers }))
        .catch((error: AxiosError) => {
            if (error.response) return ({ statusCode: error.response.status, body: error.response.data, error });
            else if (error.isAxiosError) return ({ statusCode: 999, body: { message: error.request.response || "HTTP Client Error", error } });
            else return ({ statusCode: 999, body: { message: "message" in error ? error.message : "Error did not have a message", error } });
        });
};

export default httpRequest 
