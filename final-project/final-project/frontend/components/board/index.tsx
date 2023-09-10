import { useState } from "react";

export default function Board() {
  const [message, setMessage] = useState<string>("");

  function handleMessage(newMessage: string) {
    setMessage(newMessage);
  }

  return (
    <div>
      {/* input */}
      <textarea
        className="block border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue w-full sm:w-1/2"
        rows={4}
        placeholder="Type your message here!"
        value={message}
        onChange={(e) => handleMessage(e.target.value)}
      />
      <button className="mt-4 bg-purple hover:bg-dark-purple text-white font-bold py-2 px-4 rounded">
        Mint Message
      </button>

      {/* board */}
      <hr className="border-1 rounded my-8 border-blue" />
    </div>
  );
}
