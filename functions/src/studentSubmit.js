const path = require("path");
const AWS = require("aws-sdk");
const csv = require("csvtojson");
const { DateTime } = require("luxon");
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

function randomScore() {
  return Math.floor(Math.random() * 30) + 70;
}

async function getSubmissionTime() {
  const res = await doc.get({
    TableName: "la-config",
    Key: {
      name: "time",
    }
  }).promise();

  return res.Item?.value;
}

async function hasSubmitted(matric = "") {
  const res = await doc.get({
    TableName: "la-submissions",
    Key: {
      matricNumber: matric?.trim(),
    }
  }).promise();

  return res.Item?.matricNumber ? true : false;
}

async function isValidStudent(matric = "") {
  const students = await csv().fromFile(path.resolve(__dirname, "../assets/students-list.csv"));
  const index = students.findIndex(i => i.matric?.trim() == matric?.trim());
  return index == -1 ? false : true;
}

exports.handler = async (event = {}) => {
  let data = {};
  try {
    data = JSON.parse(event.body || "{}");
  } catch {}

  // validations
  if (!data.matric) return handleResponse(422, true, "Validation Error: missing one or more required fields: (matric)");
  if (!(await isValidStudent(data.matric))) return handleResponse(401, true, `Unauthorized, ${data.matric} is not a student of this course.`);
  if (await hasSubmitted(data.matric)) return handleResponse(401, true, `Unauthorized, ${data.matric} has previously made a submission`);

  const time = await getSubmissionTime();
  const createdAt = new Date().toISOString();

  let { minutes } = DateTime
    .fromISO(createdAt)
    .diff(DateTime.fromISO(time), "minutes");
  
  if (minutes >= 61) {
    // deadline has passed
    return handleResponse(401, true, "Unauthorized, submission grace has passed.");
  }

  // calculate penalty from minutes
  let penalty = 0;
  if (minutes >= 15 ) {
    penalty = Math.round(minutes / 15) * 5;
  }

  let score = randomScore();

  try {
    await doc.put({
      TableName: "la-submissions",
      Item: {
        matricNumber: data.matric?.trim(),
        createdAt,
        score,
        penalty,
        totalScore: score - penalty,
      },
    }).promise();
  } catch (error) {
    console.log("insert error: ", error);
  }

  return handleResponse(201, false, "Submission received");
};
