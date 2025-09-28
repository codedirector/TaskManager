import { cookies } from "next/headers";
import admin from "firebase-admin";

const adminConfig = {
  type: process.env.type,
  projectId: process.env.projectId,
  privateKeyId: process.env.privateKeyId,
  privateKey: process.env.privateKey?.replace(/\\n/g, '\n'),
  clientEmail: process.env.clientEmail,
  clientId: process.env.clientId,
  authUri: process.env.authUri,
  tokenUri: process.env.tokenUri,
  authProviderX509CertUrl: process.env.authProviderX509CertUrl,
  clientC509CertUrl: process.env.clientC509CertUrl,
  universeDomain: process.env.universeDomain,
};
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
  adminConfig
),
  });
}
export async function verifySession() {
  // console.log("hello/fkmlfnd",process.env.FIREBASE_ADMIN_KEY)

  const token =(await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}
