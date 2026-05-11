import { OAuth2Client } from "google-auth-library";

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }

  return new OAuth2Client(clientId);
}

export async function verifyGoogleIdToken(idToken) {
  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google token");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}
