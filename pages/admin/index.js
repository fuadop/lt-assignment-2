import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image"

export default function Admin() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [payload, setPayload] = useState({
    email: "",
    password: "",
  });

  const handleChange = (key, e) => {
    setPayload((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleLogin = () => {
    if (payload.email != "admin@lasu.edu.ng" && payload.password != "admin123") {
      setErrorMessage("Incorrect email or password");
      return;
    }

    setErrorMessage("");
    if (sessionStorage != undefined) {
      sessionStorage.setItem("password-token", "YWRtaW4xMjM=");
    }

    router.replace("/admin/dashboard");
  };

  return (
    <div className="bg-[#363740] flex flex-row justify-center items-center h-screen w-screen">
      <div className="bg-white h-fit p-6 w-[35%] rounded-lg">
        <div className="mb-10 text-center">
          <Image src="/thirteen.svg" width={40} height={40} className="inline mb-5"/>
          <p className="font-bold text-black text-2xl">Login to dashboard</p>        
          <p className="text-gray-500">Enter your email and password below</p>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-500 font-bold mb-1">Email</label>
          <input id="email" type="email" placeholder="Email address" className="border rounded-lg p-2 w-full" onChange={handleChange.bind(this, "email")} />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-500 font-bold mb-1">Password</label>
          <input id="password" type="password" placeholder="Password" className="border rounded-lg p-2 w-full" onChange={handleChange.bind(this, "password")} />
          <p className="text-xs text-red-500">{ errorMessage }</p>
        </div>

        <button type="submit" className="block bg-blue-700 hover:bg-blue-500 text-white capitalize shadow-lg w-full rounded-lg p-4 my-12" onClick={handleLogin}>Log In</button>
      </div>
    </div>
  )
}