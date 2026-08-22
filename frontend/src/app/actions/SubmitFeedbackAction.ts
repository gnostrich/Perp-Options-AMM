'use server';

import { google } from 'googleapis';

interface FeedbackBody {
  telegramHandle: string;
  comments: string;
}

interface GoogleCredentials {
  client_email?: string;
  client_id?: string;
  private_key?: string;
}

async function appendFeedbackToSheet(body: FeedbackBody) {
  if (!process.env.GOOGLE_SERVICE_KEY) {
    throw new Error('GOOGLE_SERVICE_KEY env var missing');
  }

  const credsJson = Buffer.from(process.env.GOOGLE_SERVICE_KEY, 'base64').toString();
  const creds = JSON.parse(credsJson) as GoogleCredentials;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      client_id: creds.client_id,
      private_key: creds.private_key,
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      "https://www.googleapis.com/auth/drive.file",
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const sheets = google.sheets({ auth, version: 'v4' });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.DATABASE_ID,
    range: 'Feedback!A2',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[body.telegramHandle, body.comments]] },
  });

  return response.data;
}

export async function submitFeedbackUnsafe(
  telegramHandle: string,
  comments: string,
) {
  const cleanHandle = telegramHandle.replace(/^@+/, '').trim();
  const cleanComments = comments.trim();

  if (!cleanHandle || !cleanComments) {
    throw new Error('Telegram handle and comment are required');
  }

  await appendFeedbackToSheet({ telegramHandle: cleanHandle, comments: cleanComments });
  return { ok: true };
}
