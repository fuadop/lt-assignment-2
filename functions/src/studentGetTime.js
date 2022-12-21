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
  let time = "";
  try {
    let res = await doc.get({
      TableName: "la-config",
      Key: { name: "time" }
    }).promise();
    time = res.Item?.value || "";
  } catch {}

  return handleResponse(200, false, "Submission time fetched", { time });
};
