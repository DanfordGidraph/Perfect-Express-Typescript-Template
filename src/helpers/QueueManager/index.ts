import { nanoid } from 'nanoid'
import { writeDocument } from "../Firebase";
import { sanitizeString } from '@utilities/Tools';

const { QUE_COLLECTION } = process.env;
export const enqueueWork = async ({ endpoint = '', doc_path = '', headers = {}, error_message = '' }) => {
    const job_id = sanitizeString(nanoid()).toUpperCase()
    await writeDocument(
        `${QUE_COLLECTION}/${job_id}`,
        {
            headers,
            status: 'FAILED',
            timestamp: Date.now(),
            last_error: error_message,
            payload: { endpoint, doc_path },
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
        });

}