import { supabase } from './supabase';

// No email key lives in the browser. Sending happens in /api/* (Vercel serverless functions),
// and subscribers are stored in the Supabase `subscribers` table.

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'unsubscribed';
  created_at: string;
}

type Result = { success: boolean; message: string };

const post = async (path: string, body: unknown, token?: string): Promise<Result> => {
  try {
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    return (await r.json()) as Result;
  } catch {
    return { success: false, message: 'Network error. Please try again.' };
  }
};

const adminToken = async () => (await supabase.auth.getSession()).data.session?.access_token;

export const addSubscriber = (email: string, name?: string) => post('/api/subscribe', { email, name });

export const getSubscribers = async (): Promise<Subscriber[]> => {
  const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Subscriber[];
};

export const deleteSubscriber = async (email: string) => {
  const { error } = await supabase.from('subscribers').delete().eq('email', email);
  if (error) throw error;
};

export const sendNewsletter = async (subject: string, content: string) =>
  post('/api/send', { type: 'newsletter', subject, content }, await adminToken());

export const sendProjectAnnouncement = async (projectName: string, category: string) =>
  post('/api/send', { type: 'announcement', projectName, category }, await adminToken());
