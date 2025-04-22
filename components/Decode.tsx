import React, { useState, useRef } from "react";
import { Card, Image, Button, Divider, Textarea, Input } from "@nextui-org/react";
import CryptoJS from "crypto-js";

const Decode = () => {
  const [files, setFiles] = useState<{ data: string; name: string; key: string; type: string }[]>([]);
  const [decodedData, setDecodedData] = useState<
    {
      width: number;
      height: number;
      text: string;
      image: string | null;
      name: string;
      error?: string;
    }[]
  >([]);
  const [confirmation, setConfirmation] = useState<string>("");
  const [keyVisibility, setKeyVisibility] = useState<boolean[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_FILES = 4;
  const DELIMITER = "||";
  const KEY_LENGTH = 6;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const totalSelected = files.length + selectedFiles.length;
    if (totalSelected > MAX_FILES) {
      setConfirmation(`⚠️ You can only upload a maximum of ${MAX_FILES} files.`);
      setTimeout(() => setConfirmation(""), 2000);
      return;
    }

    const readers = Array.from(selectedFiles).map((file) => {
      return new Promise<{ data: string; name: string; key: string; type: string }>((resolve, reject) => {
        const reader = new FileReader();
        if (file.type.startsWith("image/")) {
          reader.onloadend = () => resolve({ data: reader.result as string, name: file.name, key: "", type: "image" });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else if (file.type === "text/plain") {
          reader.onloadend = () => resolve({ data: reader.result as string, name: file.name, key: "", type: "text" });
          reader.onerror = reject;
          reader.readAsText(file);
        } else {
          reject(new Error("Unsupported file type"));
        }
      });
    });

    Promise.all(readers)
      .then((loadedFiles) => {
        setFiles((prev) => [...prev, ...loadedFiles]);
      })
      .catch(() => {
        setConfirmation("⚠️ Error reading one or more files.");
        setTimeout(() => setConfirmation(""), 2000);
      });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;

    const totalSelected = files.length + droppedFiles.length;
    if (totalSelected > MAX_FILES) {
      setConfirmation(`⚠️ You can only drop a maximum of ${MAX_FILES} files.`);
      setTimeout(() => setConfirmation(""), 2000);
      return;
    }

    const readers = Array.from(droppedFiles).map((file) => {
      return new Promise<{ data: string; name: string; key: string; type: string }>((resolve, reject) => {
        const reader = new FileReader();
        if (file.type.startsWith("image/")) {
          reader.onloadend = () => resolve({ data: reader.result as string, name: file.name, key: "", type: "image" });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else if (file.type === "text/plain") {
          reader.onloadend = () => resolve({ data: reader.result as string, name: file.name, key: "", type: "text" });
          reader.onerror = reject;
          reader.readAsText(file);
        } else {
          reject(new Error("Unsupported file type"));
        }
      });
    });

    Promise.all(readers)
      .then((loadedFiles) => {
        setFiles((prev) => [...prev, ...loadedFiles]);
      })
      .catch(() => {
        setConfirmation("⚠️ Error reading one or more files.");
        setTimeout(() => setConfirmation(""), 2000);
      });
  };

  const decryptData = (encryptedData: string, key: string): { data: string; hasError: boolean } => {
    if (key.length !== KEY_LENGTH) throw new Error(`Key must be exactly ${KEY_LENGTH} characters.`);
    if (!key || key.trim() === "") {
      return { data: "No data found", hasError: true };
    }
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
    return new Promise<{ text: string; embeddedImage: string | null; error?: string; width: number; height: number }>(
      (resolve, reject) => {
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
            if (charCode === 0) break;
            message += String.fromCharCode(charCode);
          }

          if (!message) {
            resolve({ text: "No hidden data found", embeddedImage: null, width: 0, height: 0 });
            return;
          }

          const parts = message.split(DELIMITER);
          let text = "";
          let embeddedImage: string | null = null;
          let customWidth: number = 0;
          let customHeight: number = 0;

          if (parts.length > 0 && message.length > 0) {
            const base64ImageRegex = /^data:image\/(png|jpeg|jpg);base64,[\w+\/=]+$/;
            let hasError = false;

            const processParts = async () => {
              for (const part of parts) {
                const { data: decryptedPart, hasError: decryptionError } = decryptData(part, key);
                if (decryptionError) {
                  hasError = true;
                } else if (base64ImageRegex.test(decryptedPart)) {
                  embeddedImage = decryptedPart;
                  await new Promise((resolveImg, rejectImg) => {
                    const tempImg = new window.Image();
                    tempImg.src = decryptedPart;
                    tempImg.onload = () => {
                      customWidth = tempImg.width;
                      customHeight = tempImg.height;
                      resolveImg(null);
                    };
                    tempImg.onerror = () => {
                      console.warn("Could not load image to get dimensions");
                      resolveImg(null);
                    };
                  });
                } else if (decryptedPart) {
                  text += decryptedPart + " ";
                }
              }

              if (!text && !embeddedImage) {
                text = hasError ? "Error: Wrong decryption key" : "No hidden data found";
                if (hasError) {
                  resolve({ text, embeddedImage: null, error: "Wrong key", width: 0, height: 0 });
                  return;
                }
              }

              resolve({
                text: text.trim(),
                embeddedImage,
                width: customWidth,
                height: customHeight,
              });
            };

            processParts();
          } else {
            resolve({
              text: "No hidden data found",
              embeddedImage: null,
              width: 0,
              height: 0,
            });
          }
        };

        img.onerror = () => reject("Failed to load image.");
      }
    );
  };

  const decodeTextFile = (fileContent: string, key: string) => {
    return new Promise<{ text: string; embeddedImage: string | null; error?: string; width: number; height: number }>(
      (resolve) => {
        try {
          const parts = fileContent.split(DELIMITER);
          if (parts.length < 2) {
            resolve({ text: "No hidden data found", embeddedImage: null, width: 0, height: 0 });
            return;
          }

          const encodedData = parts[parts.length - 1];
          const decodedMessage = atob(encodedData);
          const messageParts = decodedMessage.split(DELIMITER);
          let text = "";
          let embeddedImage: string | null = null;
          let customWidth: number = 0;
          let customHeight: number = 0;
          const base64ImageRegex = /^data:image\/(png|jpeg|jpg);base64,[\w+\/=]+$/;
          let hasError = false;

          const processParts = async () => {
            for (const part of messageParts) {
              const { data: decryptedPart, hasError: decryptionError } = decryptData(part, key);
              if (decryptionError) {
                hasError = true;
              } else if (base64ImageRegex.test(decryptedPart)) {
                embeddedImage = decryptedPart;
                await new Promise((resolveImg, rejectImg) => {
                  const tempImg = new window.Image();
                  tempImg.src = decryptedPart;
                  tempImg.onload = () => {
                    customWidth = tempImg.width;
                    customHeight = tempImg.height;
                    resolveImg(null);
                  };
                  tempImg.onerror = () => {
                    console.warn("Could not load image to get dimensions");
                    resolveImg(null);
                  };
                });
              } else if (decryptedPart) {
                text += decryptedPart + " ";
              }
            }

            if (!text && !embeddedImage) {
              text = hasError ? "Error: Wrong decryption key" : "No hidden data found";
              if (hasError) {
                resolve({ text, embeddedImage: null, error: "Wrong key", width: 0, height: 0 });
                return;
              }
            }

            resolve({
              text: text.trim(),
              embeddedImage,
              width: customWidth,
              height: customHeight,
            });
          };

          processParts();
        } catch (error) {
          resolve({
            text: "Error decoding text file",
            embeddedImage: null,
            error: "Invalid file format",
            width: 0,
            height: 0,
          });
        }
      }
    );
  };

  const handleKeyChange = (index: number, value: string) => {
    if (value.length > KEY_LENGTH) return;
    setFiles((prev) => prev.map((file, i) => (i === index ? { ...file, key: value } : file)));
    if (keyVisibility.length <= index) {
      setKeyVisibility((prev) => [...prev, false]);
    }
  };

  const toggleKeyVisibility = (index: number) => {
    const newVisibility = [...keyVisibility];
    newVisibility[index] = !newVisibility[index];
    setKeyVisibility(newVisibility);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setConfirmation("⚠️ Please upload at least one file.");
      return;
    }
    const invalidKeyIndex = files.findIndex((file) => !file.key || file.key.length !== KEY_LENGTH);
    if (invalidKeyIndex !== -1) {
      setConfirmation(`⚠️ Encryption key for File ${invalidKeyIndex + 1} must be exactly ${KEY_LENGTH} characters.`);
      return;
    }
    try {
      const decodedResults = await Promise.all(
        files.map(async (file) => {
          if (file.type === "image") {
            const { text, embeddedImage, error, width, height } = await decodeImageMessage(file.data, file.key);
            return {
              text,
              image: embeddedImage,
              name: file.name,
              error,
              width,
              height,
            };
          } else {
            const { text, embeddedImage, error, width, height } = await decodeTextFile(file.data, file.key);
            return {
              text,
              image: embeddedImage,
              name: file.name,
              error,
              width,
              height,
            };
          }
        })
      );

      setDecodedData(decodedResults);
      setTimeout(() => {
        setDecodedData((prev) => prev.filter((data) => data.error !== "Wrong key"));
      }, 2000);
      setTimeout(() => setConfirmation(""), 2000);
    } catch (error) {
      setConfirmation(`❌ Error decoding files: ${error}`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setDecodedData([]);
  };

  const resetAll = () => {
    setFiles([]);
    setDecodedData([]);
    setConfirmation("");
    setKeyVisibility([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const isDecodingSuccessful =
    decodedData.length > 0 &&
    decodedData.every((data) => !data.error && (data.text !== "No hidden data found" || data.image));

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
              Upload <strong className="text-red-400">images or text files</strong> to{" "}
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
            {files.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 w-full max-h-40 overflow-y-auto mb-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative text-center group">
                      {file.type === "image" ? (
                        <Image
                          src={file.data}
                          alt={`Uploaded ${file.name}`}
                          className="w-full h-auto rounded-md transition-all duration-300 group-hover:brightness-75"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
                          {file.name}
                        </div>
                      )}
                      <button
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-md w-20 h-8 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-sm shadow-md"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Remove
                      </button>
                      <span className="block mt-1 text-sm text-gray-500 truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
                {files.length < MAX_FILES && (
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
                Click to upload or drag & drop up to 4 images or text files
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,text/plain"
              multiple
              onChange={handleFileChange}
            />
          </div>

          <Divider className="my-4" />

          {files.length > 0 && (
            <div className="mb-4">
              {files.map((file, index) => (
                <div key={index} className="mb-4">
                  <Input
                    fullWidth
                    size="lg"
                    label={`Encryption Key for File ${index + 1}`}
                    placeholder={`Enter ${KEY_LENGTH}-character key`}
                    value={file.key}
                    onChange={(e) => handleKeyChange(index, e.target.value)}
                    type={keyVisibility[index] ? "text" : "password"}
                    className="text-black"
                    variant="bordered"
                    color={
                      file.key && file.key.length !== KEY_LENGTH && decodedData[index]?.error === "Wrong key"
                        ? "danger"
                        : "primary"
                    }
                    classNames={{
                      input: "text-black dark:text-white",
                      label: "text-gray-500 dark:text-gray-400",
                      inputWrapper: `${
                        decodedData[index]?.error === "Wrong key"
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow`,
                    }}
                    endContent={
                      <Button
                        isIconOnly
                        variant="light"
                        onClick={() => toggleKeyVisibility(index)}
                        className="focus:outline-none"
                      >
                        {keyVisibility[index] ? (
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </Button>
                    }
                  />
                  {file.key && file.key.length !== KEY_LENGTH && (
                    <p className="text-red-500 text-sm mt-1">Key must be exactly {KEY_LENGTH} characters</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {decodedData.length > 0 ? (
            <>
              {decodedData.map((data, index) => (
                <div key={index} className="mb-6">
                  <p className="text-gray-500 font-bold mb-2">{data.name}:</p>
                  {data.error && <p className="text-red-500 mb-2">{data.text}</p>}
                  {!data.error && data.text && data.text !== "No hidden data found" && (
                    <Textarea readOnly value={data.text} label="Decoded Text" className="mt-2 text-black" />
                  )}
                  {!data.error && data.image && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Hidden Image:</p>
                      <Image
                        src={data.image}
                        alt={`Hidden Image from ${data.name}`}
                        className="rounded-md object-contain"
                        width={data.width}
                        height={data.height}
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
                onClick={isDecodingSuccessful ? resetAll : handleSubmit}
              >
                {isDecodingSuccessful ? "Decode More Files" : "Submit Again"}
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