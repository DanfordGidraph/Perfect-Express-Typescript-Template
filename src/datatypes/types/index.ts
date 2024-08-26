import { REST_METHODS } from "@datatypes/enums";

export type RESTRequest = {
    url: string;
    method: REST_METHODS;
    headers: Record<string, string>;
    params: Record<string, string> | URLSearchParams | FormData;
    basic_token?: string | undefined;
    bearer_token?: string | undefined;
    extraOptions?: Record<string, any> | undefined;
    loggingOpts?: { logData: boolean, logHeaders: boolean }
}

export type DBUser = {
    username: string;
    password: string;
    email: string;
    role: string;
    phone?: string;
}

export type JWTPayload = {
    "iat": number
    "exp": number
    "aud": string
    "iss": string
    "uid": string
    "role": string
    "username": string
}
