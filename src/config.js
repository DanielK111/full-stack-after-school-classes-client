const hostname = window.location.hostname;

const isLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname.startsWith("192.168.") ||
  hostname.startsWith("10.");

let API_BASE_URL;

if (isLocal) {
  API_BASE_URL = "http://localhost:8080";
} else if (hostname.includes("aws")) {
  API_BASE_URL = "https://aws-backend-url.com";
} else {
  API_BASE_URL = "https://full-stack-after-school-classes-server.onrender.com";
}

window.env = { API_BASE_URL };
