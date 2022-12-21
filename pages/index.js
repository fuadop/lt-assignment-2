import { Spinner } from "flowbite-react";
import { DateTime } from "luxon";
import { useEffect, useState } from "react"
import Student from "../api/student";

export default function Home() {
  const [subTime, setSubTime] = useState("");
  const [matric, setMatric] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    error: false,
    msg: "",
  });

  useEffect(() => {
    const fetchTime = async () => {
      let data = {};
      try {
        ({ data } = await Student.studentGetTime());
      } catch {}

      if (data.time) setSubTime(data.time);
    };

    fetchTime();
  }, []);

  const handleChange = (e) => {
    setMatric(e.target.value);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
    } catch {}

    let data = {};
    setLoading(true);
    try {
      ({ data } = await Student.studentSubmit(matric));
    } catch {}
    setLoading(false);

    setMessage({
      error: data.error || data.message?.includes("Error"),
      msg: data.message,
    });

    setTimeout(() => {
      setMessage({ error: false, message: "" });
    }, [5000]);
  }

  return (
    <div className="py-2 px-2 md:px-4 lg:px-10">
      <p className="text-lg"><strong className="underline inline-block mr-2">Submission time:</strong>{subTime ? DateTime.fromISO(subTime).toLocaleString(DateTime.DATETIME_MED) : "unknown"}</p>

      <div class="flex justify-between items-stretch flex-wrap gap-3 my-3">
        <div class="border border-black p-3 md:w-[49%]">
          <p class="text-sm mb-4 border-b border-black">Make a submission</p>

          <form action="#" id="submission_form" onSubmit={handleSubmit}>
            <div class="flex flex-col justify-center gap-3 items-start w-full">
              <div class="flex flex-col w-full">
                <label htmlFor="matric_number" class="block text-xs text-black">Matric Number</label>
                <input type="number" name="matric_number" id="matric_number" class="rounded border border-gray-500 p-1 block focus:border-black focus:outline-none" onChange={handleChange} />
                <p class={"text-xs " + (message.error ? "text-red-500" : "text-green-500")} id="form_error"> { message?.msg } </p>
              </div>
              <button type="submit" class="block bg-black text-sm text-white hover:bg-gray-500 px-3 py-2 rounded w-full mt-1 disabled:bg-gray-400" disabled={loading || !matric?.trim()}>
                { loading && <Spinner className="inline-block mr-2" /> }
                { loading ? "Loading..." : "Submit"}
              </button>
            </div>
          </form>

          <p class="text-xs mt-3">
            For demo purposes, a random grade between 70-100 will be generated for every submission made.
          </p>
        </div>

        <div class="p-2 border border-black flex justify-center items-center md:w-[49%]">
          <div class="">
            <p class="text-sm">
              Please note any submissions made after the time stated above will incur an incremental
              penalty.
            </p>
            <p class="text-sm font-semibold mt-2">
              Penalty: for every "y" x 15mins after submission time is equivalent to -5 multiplied "y" points.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
