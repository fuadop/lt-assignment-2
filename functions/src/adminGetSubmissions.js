const path = require("path");
const AWS = require("aws-sdk");
const csv = require("csvtojson");
const { DateTime } = require("luxon");
const { ExportToCsv } = require("export-to-csv");

const doc = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const _csv = new ExportToCsv({
	fieldSeparator: ',',
	quoteStrings: '"',
	decimalSeparator: '.',
	showLabels: true, 
	useTextFile: false,
	useBom: true,
	useKeysAsHeaders: true,
});


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

async function uploadReport(reports, key) {
  if (!reports.length) {
    reports[0] = {};
  }
  const csvString = _csv.generateCsv(reports, true);
  const params = {
    Bucket: "la-config-bucket",
    Key: key,
    Body: csvString
  };
  // send to s3
  return await s3.upload(params).promise();
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

  let items = [];
  try {
    ({ Items: items = [] } = await doc.scan({
      TableName: "la-submissions",
    }).promise());
  } catch {}

  let students = {};
  try {
    let _students = await csv().fromFile(path.resolve(__dirname, "../assets/students-list.csv"));
    _students.forEach(std => students[std.matric] = std.fullname );
  } catch {}
  const submissions = items.map(i => ({ ...i, fullName: students[i.matricNumber] }));
  const reports = submissions.map(i => {
    return {
      "Matric Number": i.matricNumber,
      "Full Name": i.fullName,
      "Entry class": i.matricNumber?.startsWith("1702") ? "UTME" : "Direct Entry",
      "Score": i.score,
      "Time Submitted": DateTime.fromISO(i.createdAt).setZone("Africa/Lagos").toLocaleString(DateTime.DATETIME_MED),
      "Penalty": i.penalty,
      "Total Score": i.totalScore,
    };
  });

  // generate pre-signed url of items
  let url = "";
  let key = "reports.csv";
  try {
    await uploadReport(reports, key);
    url = await s3.getSignedUrlPromise("getObject", {
      Bucket: "la-config-bucket",
      Key: key,
      Expires: 3600 * 4, // expires in 4hrs
    });
  } catch {}

  return handleResponse(200, false, "Submissions fetched", { submissions, url });
};
