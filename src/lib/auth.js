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
//     {
// "type":"service_account",
// "project_id": "task-manager-e3891",
// "private_key_id": "9bb76340a199fe106938e4371ce7612a3f3b78d9",
// "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCMUTrUWJv5VvXg\n4Lug0k3O25FkgC+8fWqwfNG+WFKhj4yC/yykPr9Uh1uSIAPS8XIFjrCsRHrwmyQD\n7l2qdK+3Nus1CvolEkd5hY1HadJAkWSLRUWyqAXkqA3ZveZe2jgkHF7HrAK0jJf9\nA+CiKuj1BbJsIkS+Zn42cmrRsGkT4ihZ38UKca6DuZmRcpTqB2i1h+JSkwIXyid6\ncsbjpH2L7gNoCt+0EYSuL47Fa3KgdUgBN0bU7BRtqdLO8IlZr761GltUB/WpBfUF\ntjdMc/o3wMYpHwGGypDxR3TRynmXXt+nUqxE5piVIdSUyO/uIsMEKioBiyENGmZ5\ntPrWlctbAgMBAAECggEAEEuitGRyALv7pBkVUTD7Pkm7kdtdL9u01zg3t45UUlT0\ncYYm7hAnci6iEM9NAmNt5X1TwT3WtTifLyGwmQoiGfnzyN40fLepu1AqPx/n/f2k\nmpP56yyeOpbVvPLT3TIkkPUGgNPWIJevUv/vR4YKNeJqfSphp2cJw1L4Ws/M9DUE\ng6U2v6nsjPOdhghXqQEI3u1T34+OGb2b3f82Tvt0G+gYY6Q7w/P4xJZV6ZU6O+Xo\nYYJvf7pWvWUO1mStPGqCULcpOCMT/ERCgdlu/ZJ5WAc3bitIrrSdg5Ouc2nLBYPX\nIDcIYNMgO23RPidam8Nub+JXZcjP/t12/QN2E0oLyQKBgQDEiLUhXwvIxv88mcWx\nG4RMi4pWzwzK2mFanfPcrB38VpIgYZTRxTeQ3gyQk3tcu2QSbxjR2Vrt7VC2YhZL\nzPCTY8JOQVvl8Bv0ZlV0OwvsH0DNDmgKixnBF9htuWU+CE8EtnhuzX1/GHI4MILW\nI5xx+/0kcizCjs4KRFU5mpt4zwKBgQC2xgrXK20FW9oh+4xGE/rStI/mXfj92QRg\ns+UffTFNiDrhYs2pSgvPRBvHNCcvyjing4+bSb3NeiHfqg1HKptbPaaxcJKPwtyo\nH7MS0VCuYr+P+vjt1awprvIJg4zOml488/EPBUSrnWDHv7VxPVJGj4hdyCNp1uD3\nhXHy2ubPtQKBgDTOaqSpzhfHaEMXKigZNaX/hE8o2M4UeT4I3MI5OOFZPXAX6A2p\nCPISx5t9FRNogk31rdyMo0L0ldA7cLQzP5zKnCW8p/2TU1+Ks4FEcEKkbxvpuAjF\nMUlRp+RrgQl24AxrHtbevc6NefshBbaV4O47f9vwFZi9GB1oGOIeaZG/AoGAHaSO\n+4jCfL0B6sMGZBM3edbpA7639EuvJxPmFC5UwbNXgVhp7Ivi0HHGY490z45nk9uF\nffT+wIWPWtwUnTcuzSR5lYuhaYl8ChRiEao7AJ1pXiuhFcmyy2vhO2PHgXaN1Cro\nLLx4/7BdkufnwH7miiUbQ8KC49aC1AIjkfSovIUCgYEAs2bUyfGZf/dTyXmoHzlC\nnxVVW5vnGJYl4yiWxOCWQqP7tOYZB7p+Qn/tgi/wcMgrWFW8y+Bn2JgdtkK77hlQ\nPSwj3MVdyy5HudWZkBckjF/7Oj/qjzYvIHTASYdIrnn+UstY8OZH2BuBZHTcHMw/\nzESloXUXXxzc3RftOXH5Ivg=\n-----END PRIVATE KEY-----\n",
// "client_email": "firebase-adminsdk-fbsvc@task-manager-e3891.iam.gserviceaccount.com",
// "client_id": "102596034404383966013",
// "auth_uri": "https://accounts.google.com/o/oauth2/auth",
// "token_uri": "https://oauth2.googleapis.com/token",
// "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
// "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40task-manager-e3891.iam.gserviceaccount.com",
// "universe_domain": "googleapis.com"
// }    
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
