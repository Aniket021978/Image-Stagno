import React, { useState, useRef } from "react";
import { Card, Input, Textarea, Button, Image } from "@nextui-org/react";
import CryptoJS from "crypto-js";

const EncodeText = () => {
  const [text, setText] = useState(""); // Text to hide
  const [coverText, setCoverText] = useState(""); // Cover text
  const [hiddenImage, setHiddenImage] = useState(null); // Hidden image
  const [encryptionKey, setEncryptionKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keyVisibility, setKeyVisibility] = useState(false);
  const hiddenFileInputRef = useRef(null);

  const KEY_LENGTH = 6;
  const DELIMITER = "||";

  const encryptData = (data, key) => {
    if (!key) throw new Error("Encryption key is required.");
    if (key.length !== KEY_LENGTH) throw new Error(`Key must be exactly ${KEY_LENGTH} characters.`);
    return CryptoJS.AES.encrypt(data, key).toString();
  };

  const handleHiddenFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setHiddenImage(reader.result);
    };
    reader.onerror = () => setError("Failed to read image.");
    reader.readAsDataURL(file);
  };

  const handleRemoveHiddenImage = () => {
    setHiddenImage(null);
    if (hiddenFileInputRef.current) hiddenFileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!text && !hiddenImage) {
      setError("⚠️ Please provide text or an image to encode.");
      return;
    }
    if (!encryptionKey || encryptionKey.length !== KEY_LENGTH) {
      setError(`⚠️ Encryption key must be exactly ${KEY_LENGTH} characters.`);
      return;
    }
    if (!coverText) {
      setError("⚠️ Please provide cover text to hide the encoded data.");
      return;
    }

    try {
      let combinedMessage = "";
      if (text) {
        combinedMessage += encryptData(text, encryptionKey);
      }
      if (hiddenImage) {
        if (combinedMessage) combinedMessage += DELIMITER;
        combinedMessage += encryptData(hiddenImage, encryptionKey);
      }

      // Combine cover text with encoded data
      const finalMessage = `${coverText}${DELIMITER}${btoa(combinedMessage)}`;
      const blob = new Blob([finalMessage], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "encoded_text.txt";
      a.click();
      URL.revokeObjectURL(url);

      setSuccess("✅ Successfully downloaded encoded text!");
      setTimeout(() => {
        setText("");
        setCoverText("");
        setHiddenImage(null);
        setEncryptionKey("");
        setError("");
        setSuccess("");
        if (hiddenFileInputRef.current) hiddenFileInputRef.current.value = "";
      }, 2000);
    } catch (error) {
      setError("❌ Error encoding data: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative text-neutral-200 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#181818] to-[#111]"></div>
      <div className="relative z-10 text-center">
        <p className="text-2xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-1">
          {success ? (
            <span className="text-green-400">{success}</span>
          ) : (
            <>
              Encode your <strong className="text-red-400">text</strong> and{" "}
              <strong className="text-red-400">image</strong> into{" "}
              <strong className="bg-gradient-to-r from-stone-500 to-stone-700 bg-clip-text text-transparent">
                text
              </strong>
            </>
          )}
        </p>
        <Card
          isBlurred
          className="max-w-lg w-full mx-auto p-6 my-12 border-2 border-dotted border-gray-400 rounded-lg shadow-xl bg-gray-50 dark:bg-gray-900"
        >
          <Textarea
            fullWidth
            size="lg"
            label="Text to Encode"
            placeholder="Enter text to hide"
            className="text-black mb-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

<Input
            fullWidth
            size="lg"
            label="Encryption Key"
            placeholder={`Enter ${KEY_LENGTH}-character key`}
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value.slice(0, KEY_LENGTH))}
            type={keyVisibility ? "text" : "password"}
            className="text-black mb-4"
            variant="bordered"
            color={encryptionKey && encryptionKey.length !== KEY_LENGTH ? "danger" : "primary"}
            classNames={{
              input: "text-black dark:text-white",
              label: "text-gray-500 dark:text-gray-400",
              inputWrapper: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow",
            }}
            endContent={
              <Button
                isIconOnly
                variant="light"
                onClick={() => setKeyVisibility(!keyVisibility)}
                className="focus:outline-none"
              >
                {keyVisibility ? (
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c-4.478 0-8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c-4.478 0-8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </Button>
            }
          />
          {encryptionKey && encryptionKey.length !== KEY_LENGTH && (
            <p className="text-red-500 text-sm mt-1">Key must be exactly {KEY_LENGTH} characters</p>
          )}

          <Textarea
            fullWidth
            size="lg"
            label="Cover Text"
            placeholder="Enter cover text to hide the encoded data"
            className="text-black mb-4"
            value={coverText}
            onChange={(e) => setCoverText(e.target.value)}
          />

          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-2">Image to Encode (Optional)</label>
            <div className="relative">
              <input
                type="file"
                ref={hiddenFileInputRef}
                accept="image/*"
                onChange={handleHiddenFileChange}
                className="hidden"
              />
              <Button
                onClick={() => hiddenFileInputRef.current?.click()}
                className="bg-gray-800 text-white w-full"
              >
                {hiddenImage ? "Image Selected" : "Choose Image"}
              </Button>
            </div>
            {hiddenImage && (
              <div className="relative group mt-2">
                <Image
                  src={hiddenImage}
                  alt="Hidden Image"
                  className="w-full h-auto rounded-md transition-all duration-300 group-hover:brightness-75"
                />
                <button
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-md w-20 h-8 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-sm shadow-md"
                  onClick={handleRemoveHiddenImage}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <Button
            className="mt-4 w-full bg-gradient-to-r from-green-400 to-blue-500 hover:bg-gradient-to-l cursor-pointer"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default EncodeText;