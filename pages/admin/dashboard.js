import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import Image from "next/image";
import Admin from "../../api/admin";
import { Spinner } from "flowbite-react";
import Student from "../../api/student";

export default function Dashboard() {
  const router = useRouter();

  const [initial, setInitial] = useState();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [submissionTime, setSubmissionTime] = useState();
  const [message, setMessage] = useState({ error: false, msg: "" });

  const [submissions, setSubmissions] = useState([]);
  const [downloadURL, setDownloadURL] = useState("");

  useEffect(() => {
    const token = sessionStorage?.getItem("password-token");
    if (token != "YWRtaW4xMjM=") router.replace("/admin");
  }, []);

  useEffect(() => {
    const refresh = async () => {
      let data = {};
      try {
        ({ data } = await Student.studentGetTime());
      } catch {}

      if (data.time) setInitial(data.time);
    }

    refresh();
  }, [initial]);

  useEffect(() => {
    const fetch = async () => {
      setFetching(true);
      let data = {};
      try {
        ({ data } = await Admin.adminGetSubmissions())
      } catch {}
      setFetching(false);

      if (!data.error && data.submissions?.length) {
        setSubmissions(data.submissions);
      }
      if (!data.error && data.url) {
        setDownloadURL(data.url);
      }
    };

    fetch();
  }, []);

  const handleChange = (e) => {
    setSubmissionTime(new Date(e.target.value).toISOString());
  }

  const handleUpdate = async (e = {}) => {
    try {
      e.preventDefault();
    } catch {}

    setLoading(true);
    let data = {};
    try {
      ({ data } = await Admin.adminSetTime(submissionTime));
    } catch {}
    setLoading(false);

    if (!data.error && data.time) {
      setInitial(data.time);
    }

    setMessage({
      error: data.error,
      msg: data.message,
    });

    setTimeout(() => {
      setMessage({ error: false, message: "" });
    }, 5000);
  }

  return (
    <div className="py-2 px-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-lg underline font-bold">Submissions</p>
        <a href={downloadURL} download rel="noopener noreferrer" className="block py-2 px-4 rounded bg-black text-white text-sm">
          <Image src="/download.svg" alt="download" width={20} height={20} className="inline-block mr-2" />
          Export as CSV
        </a>
      </div>
      <table class="table-auto border border-black w-full mb-5">
        <thead>
          <tr>
            <th class="border border-black">Matric Number</th>
            <th class="border border-black">Full Name</th>
            <th class="border border-black">Entry class</th>
            <th class="border border-black">Score</th>
            <th class="border border-black">Time submitted</th>
            <th class="border border-black">Penalty</th>
            <th class="border border-black">Total Score</th>
          </tr>
        </thead>
        <tbody id="entries">
          { (submissions || []).map((sub = {}) => (
            <tr>
              <td className="border-black border">{sub.matricNumber}</td>
              <td className="border-black border">{sub.fullName}</td>
              <td className="border-black border">{sub.matricNumber?.startsWith("1702") ? "UTME" : "Direct Entry"}</td>
              <td className="border-black border">{sub.score}</td>
              <td className="border-black border">{sub.createdAt ? DateTime.fromISO(sub.createdAt).toLocaleString(DateTime.DATETIME_MED) : ""}</td>
              <td className="border-black border">{sub.penalty}</td>
              <td className="border-black border">{sub.totalScore}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="underline font-bold mb-1">Set submission time</p>
      <form action="#" className="flex justify-start items-center gap-2" onSubmit={handleUpdate}>
        <div className="">
          <input type="datetime-local" name="submission_date" id="submission_date" className="border p-2 rounded" onChange={handleChange}/>
        </div>
        <div className="">
          <button type="submit" className="py-2 px-4 rounded bg-black text-white disabled:bg-gray-600" disabled={loading}>
            { loading && <Spinner className="inline-block mr-2" /> }
            { loading ? "Loading..." : "Update"}
          </button>
        </div>
      </form>
      <p className="text-sm">Current submission time: { initial ? DateTime.fromISO(initial).toLocaleString(DateTime.DATETIME_MED) : "" }</p>
      <p className={"text-sm " + (message.error ? "text-red-500" : "text-green-500")}>{ message?.msg }</p>

    </div>
  );
}