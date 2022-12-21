const AWS = require("aws-sdk");
const doc = new AWS.DynamoDB.DocumentClient();

function handleResponse(statusCode = 200, error = false, message = "", data = {}) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    isBase64Encoded: false,
    body: JSON.stringify({
      error,
      success: !error,
      result: !error,
      message,
      ...data
    })
  }
};

exports.handler = async (event = {}) => {
  let data = {};
  try {
    data = JSON.parse(event.body || "{}");
  } catch {}

  // auth
  let apiKey = (event.headers || {})["Authorization"] || (event.headers || {})["authorization"];
  let password = Buffer.from(apiKey || "", "base64").toString(); // admin password
  if (password != "admin123") return handleResponse(401, true, "Unauthorized");

  if (!data.time) return handleResponse(422, true, "Validation Error: missing one or more required fields: (time)");

  try {
    await doc.put({
      TableName: "la-config",
      Item: {
        name: "time",
        value: data.time,
      },
    }).promise();
  } catch {}

  return handleResponse(201, false, "Submission time updated", { time: data.time });
};
