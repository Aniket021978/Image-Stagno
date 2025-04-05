import React, { useState, useRef } from "react";
import { Card, Image, Button, Divider, Textarea, Input } from "@nextui-org/react";
import CryptoJS from "crypto-js";

const Decode = () => {
  const [images, setImages] = useState<{ data: string; name: string; key: string }[]>([]);
  const [decodedData, setDecodedData] = useState<
    { text: string; image: string | null; name: string; error?: string }[]
  >([]);
  const [confirmation, setConfirmation] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_FILES = 4;
  const DELIMITER = "||";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const totalSelected = images.length + selectedFiles.length;
    if (totalSelected > MAX_FILES) {
      setConfirmation(`⚠️ You can only upload a maximum of ${MAX_FILES} files.`);
      setTimeout(() => setConfirmation(""), 2000);
      return;
    }

    const readers = Array.from(selectedFiles).map((file) => {
      return new Promise<{ data: string; name: string; key: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ data: reader.result as string, name: file.name, key: "" });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((loadedFiles) => {
      setImages((prev) => [...prev, ...loadedFiles]);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;

    const totalSelected = images.length + droppedFiles.length;
    if (totalSelected > MAX_FILES) {
      setConfirmation(`⚠️ You can only drop a maximum of ${MAX_FILES} files.`);
      setTimeout(() => setConfirmation(""), 2000);
      return;
    }

    const readers = Array.from(droppedFiles).map((file) => {
      return new Promise<{ data: string; name: string; key: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ data: reader.result as string, name: file.name, key: "" });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((loadedFiles) => {
      setImages((prev) => [...prev, ...loadedFiles]);
    });
  };

  const decryptData = (encryptedData: string, key: string): { data: string; hasError: boolean } => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) return { data: "Error: Wrong decryption key", hasError: true };
      return { data: decrypted, hasError: false };
    } catch (error) {
      return { data: "Error: Wrong decryption key", hasError: true };
    }
  };

  const decodeImageMessage = (imageData: string, key: string) => {
    return new Promise<{ text: string; embeddedImage: string | null; error?: string }>((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();
      img.src = imageData;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const imgData = ctx?.getImageData(0, 0, img.width, img.height);
        if (!imgData) return reject("Error loading image data");

        const data = imgData.data;
        let binaryMessage = "";
        for (let i = 0; i < data.length; i += 4) {
          binaryMessage += (data[i] & 1).toString();
          binaryMessage += (data[i + 1] & 1).toString();
          binaryMessage += (data[i + 2] & 1).toString();
        }
        let message = "";
        for (let i = 0; i < binaryMessage.length; i += 8) {
          const byte = binaryMessage.slice(i, i + 8);
          if (byte.length < 8) break;
          const charCode = parseInt(byte, 2);
          if (charCode < 32 || charCode > 126) break;
          message += String.fromCharCode(charCode);
        }
        const parts = message.split(DELIMITER);
        let text = "";
        let embeddedImage = null;

        // अगर की खाली है और मैसेज मौजूद है, तो "No hidden data found" रिटर्न करें
        if (!key && parts.length > 0 && message.length > 0) {
          resolve({ text: "No hidden data found", embeddedImage: null });
          return;
        }

        if (parts.length > 0 && message.length > 0) {
          const base64ImageRegex = /^data:image\/(png|jpeg|jpg);base64,[\w+\/=]+$/;
          let hasError = false;
          parts.forEach((part) => {
            const { data: decryptedPart, hasError: decryptionError } = decryptData(part, key);
            if (decryptionError) {
              hasError = true;
            } else if (base64ImageRegex.test(decryptedPart)) {
              embeddedImage = decryptedPart;
            } else if (decryptedPart) {
              text = decryptedPart;
            }
          });

          if (!text && !embeddedImage) {
            text = hasError ? "Error: Wrong decryption key" : "No hidden data found";
            if (hasError) {
              resolve({ text, embeddedImage: null, error: "Wrong key" });
              return;
            }
          }
        } else {
          text = "No hidden data found";
        }

        resolve({ text, embeddedImage });
      };

      img.onerror = () => reject("Failed to load image.");
    });
  };

  const handleKeyChange = (index: number, value: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, key: value } : img))
    );
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      setConfirmation("⚠️ Please upload at least one image.");
      return;
    }

    try {
      const decodedResults = await Promise.all(
        images.map(async (image) => {
          const { text, embeddedImage, error } = await decodeImageMessage(image.data, image.key);
          return { text, image: embeddedImage, name: image.name, error };
        })
      );

      setDecodedData(decodedResults);
      setTimeout(() => setConfirmation(""), 2000);
    } catch (error) {
      setConfirmation(`❌ Error decoding images: ${error}`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setDecodedData([]);
  };

  const resetAll = () => {
    setImages([]);
    setDecodedData([]);
    setConfirmation("");
    fileInputRef.current?.click();
  };

  const hasAnyWrongKey = decodedData.some(data => data.error === "Wrong key");
  const isDecodingSuccessful = decodedData.length > 0 && decodedData.some(
    (data) => !data.error && data.text !== "No hidden data found"
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative text-neutral-200 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#181818] to-[#111]"></div>

      <div className="relative z-10 text-center">
        <p className="text-2xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
          {decodedData.length > 0 && isDecodingSuccessful ? (
            <>
              <strong className="text-green-400">✅ Decoded</strong> successfully!
            </>
          ) : (
            <>
              Upload <strong className="text-red-400">images</strong> to{" "}
              <strong className="text-red-400">decode</strong> the{" "}
              <strong className="bg-gradient-to-r from-stone-500 to-stone-700 bg-clip-text text-transparent">
                hidden messages
              </strong>
            </>
          )}
        </p>

        <Card
          isBlurred
          className="max-w-lg w-full mx-auto p-6 my-12 border-2 border-dotted border-gray-400 rounded-lg shadow-xl bg-gray-50 dark:bg-gray-900"
        >
          <div
            className="flex flex-col items-center justify-center cursor-pointer w-full min-h-48"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {confirmation && <p className="text-sm mb-2 text-red-500">{confirmation}</p>}
            {images.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 w-full max-h-40 overflow-y-auto mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative text-center group">
                      <Image
                        src={image.data}
                        alt={`Uploaded ${image.name}`}
                        className="w-full h-auto rounded-md transition-all duration-300 group-hover:brightness-75"
                      />
                      <button
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-md w-20 h-8 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-sm shadow-md"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Remove
                      </button>
                      <span className="block mt-1 text-sm text-gray-500 truncate">{image.name}</span>
                    </div>
                  ))}
                </div>
                {images.length < MAX_FILES && (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-800 text-white w-full"
                  >
                    Add More
                  </Button>
                )}
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="text-center text-gray-500 border-2 border-dotted border-gray-400 rounded-lg p-6 w-full"
              >
                Click to upload or drag & drop up to 4 images
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>

          <Divider className="my-4" />

          {images.length > 0 && (
            <div className="mb-4">
              {images.map((image, index) => (
                <Input
                  key={index}
                  fullWidth
                  size="lg"
                  label={`Encryption Key for Image ${index + 1}`}
                  placeholder={`Enter encryption key for Image ${index + 1}`}
                  value={image.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  className="text-black mb-4"
                  variant="bordered"
                  color={
                    decodedData[index]?.error === "Wrong key" ? "danger" : "primary"
                  }
                  isClearable
                  onClear={() => handleKeyChange(index, "")}
                  classNames={{
                    input: "text-black dark:text-white",
                    label: "text-gray-500 dark:text-gray-400",
                    inputWrapper: `${
                      decodedData[index]?.error === "Wrong key"
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow`,
                  }}
                />
              ))}
            </div>
          )}

          {decodedData.length > 0 ? (
            <>
              {decodedData.map((data, index) => (
                <div key={index} className="mb-6">
                  <p className="text-gray-500 font-bold mb-2">{data.name}:</p>
                  {data.error && (
                    <p className="text-red-500 mb-2">{data.text}</p>
                  )}
                  {!data.error && data.text && data.text !== "No hidden data found" && (
                    <Textarea
                      readOnly
                      value={data.text}
                      label="Decoded Text"
                      className="mt-2 text-black"
                    />
                  )}
                  {!data.error && data.image && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Hidden Image:</p>
                      <Image
                        src={data.image}
                        alt={`Hidden Image from ${data.name}`}
                        className="rounded-md max-h-64 w-auto"
                        onError={() => console.log(`Failed to load image from ${data.name}: ${data.image}`)}
                      />
                    </div>
                  )}
                  {!data.error && (!data.text || data.text === "No hidden data found") && !data.image && (
                    <p className="text-gray-500">No hidden data found</p>
                  )}
                </div>
              ))}
              <Button
                className="mt-4 w-full bg-gradient-to-r from-green-400 to-blue-500 hover:bg-gradient-to-l"
                onClick={handleSubmit}
              >
                Submit Again
              </Button>
            </>
          ) : (
            <Button
              className="mt-4 w-full bg-gradient-to-r from-green-400 to-blue-500 hover:bg-gradient-to-l"
              onClick={handleSubmit}
            >
              Decode
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Decode;