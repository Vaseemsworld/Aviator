import decode from "jwt-decode";

export default function decodeToken(token) {
  try {
    return decode(token);
  } catch (e) {
    return null;
  }
}
