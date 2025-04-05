import React, { useState, useRef, useEffect } from "react";
import { Input, Card, Image, Button, Divider, Textarea, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import CryptoJS from "crypto-js";

const encodeImageMessage = async (imageData: string, message: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new window.Image();
  img.src = imageData;

  return new Promise<string>((resolve, reject) => {
    img.onload = () => {
      if (!ctx) {
        console.error("Canvas context is null");
        reject("Failed to get canvas context.");
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const imgData = ctx?.getImageData(0, 0, img.width, img.height);
      if (!imgData) return reject("Error loading image data");

      const data = imgData.data;
      let binaryMessage = "";
      const fullMessage = message + "\0";

      for (let i = 0; i < fullMessage.length; i++) {
        binaryMessage += fullMessage.charCodeAt(i).toString(2).padStart(8, "0");
      }

      let messageIndex = 0;
      for (let i = 0; i < data.length && messageIndex < binaryMessage.length; i += 4) {
        if (messageIndex < binaryMessage.length) {
          data[i] = (data[i] & 0b11111110) | parseInt(binaryMessage[messageIndex++], 2); // Red
        }
        if (messageIndex < binaryMessage.length) {
          data[i + 1] = (data[i + 1] & 0b11111110) | parseInt(binaryMessage[messageIndex++], 2); // Green
        }
        if (messageIndex < binaryMessage.length) {
          data[i + 2] = (data[i + 2] & 0b11111110) | parseInt(binaryMessage[messageIndex++], 2); // Blue
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = () => reject("Failed to load image.");
  });
};
interface EncodedImage {
  data: string;
  index: number;
  hiddenFileIndex?: number;
}

const Encode = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [hiddenFiles, setHiddenFiles] = useState<string[]>([]);
  const [imageTexts, setImageTexts] = useState<(string | null)[]>([]);
  const [textImageIndices, setTextImageIndices] = useState<number[]>([]);
  const [encryptionKeys, setEncryptionKeys] = useState<(string | null)[]>([]);
  const [error, setError] = useState<string>("");
  const [tempError, setTempError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [hiddenImageIndices, setHiddenImageIndices] = useState<(number | null)[]>([]);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_FILES = 4;
  const MAX_HIDDEN_FILES = 4;
  const MAX_TEXTS = 4;
  const DELIMITER = "||";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFiles = localStorage.getItem("files");
      const savedHiddenFiles = localStorage.getItem("hiddenFiles");
      const savedImageTexts = localStorage.getItem("imageTexts");
      const savedTextImageIndices = localStorage.getItem("textImageIndices");
      const savedEncryptionKeys = localStorage.getItem("encryptionKeys");
      const savedHiddenImageIndices = localStorage.getItem("hiddenImageIndices");

      if (savedFiles) setFiles(JSON.parse(savedFiles));
      if (savedHiddenFiles) setHiddenFiles(JSON.parse(savedHiddenFiles));
      if (savedImageTexts) setImageTexts(JSON.parse(savedImageTexts));
      if (savedTextImageIndices) setTextImageIndices(JSON.parse(savedTextImageIndices));
      if (savedEncryptionKeys) setEncryptionKeys(JSON.parse(savedEncryptionKeys));
      if (savedHiddenImageIndices) setHiddenImageIndices(JSON.parse(savedHiddenImageIndices));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("files", JSON.stringify(files));
      localStorage.setItem("hiddenFiles", JSON.stringify(hiddenFiles));
      localStorage.setItem("imageTexts", JSON.stringify(imageTexts));
      localStorage.setItem("textImageIndices", JSON.stringify(textImageIndices));
      localStorage.setItem("encryptionKeys", JSON.stringify(encryptionKeys));
      localStorage.setItem("hiddenImageIndices", JSON.stringify(hiddenImageIndices));
    }
  }, [files, hiddenFiles, imageTexts, textImageIndices, encryptionKeys, hiddenImageIndices]);

  const encryptData = (data: string | null, key: string): string => {
    if (!key) throw new Error("Encryption key is required.");
    if (!data) return ""; 
    return CryptoJS.AES.encrypt(data, key).toString();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const totalSelected = files.length + selectedFiles.length;
    if (totalSelected > MAX_FILES) {
      const excessCount = totalSelected - MAX_FILES;
      setTempError(`You can only select a maximum of ${MAX_FILES} files. You tried to add ${excessCount}.`);
      setTimeout(() => setTempError(""), 2000);
      return;
    }

    const readers = Array.from(selectedFiles).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((loadedFiles) => {
      setFiles((prev) => [...prev, ...loadedFiles]);
      setImageTexts((prev) => [...prev, ...Array(loadedFiles.length).fill(null)]);
      setEncryptionKeys((prev) => [...prev, ...Array(loadedFiles.length).fill(null)]);
    });
  };

  const handleHiddenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const totalSelected = hiddenFiles.length + selectedFiles.length;
    if (totalSelected > MAX_HIDDEN_FILES) {
      const excessCount = totalSelected - MAX_HIDDEN_FILES;
      setTempError(`You can only select a maximum of ${MAX_HIDDEN_FILES} hidden files. You tried to add ${excessCount}.`);
      setTimeout(() => setTempError(""), 2000);
      return;
    }

    const readers = Array.from(selectedFiles).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((loadedFiles) => {
      setHiddenFiles((prev) => [...prev, ...loadedFiles]);
      setHiddenImageIndices((prev) => [...prev, null]);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;

    const totalSelected = files.length + droppedFiles.length;
    if (totalSelected > MAX_FILES) {
      const excessCount = totalSelected - MAX_FILES;
      setTempError(`You can only drop a maximum of ${MAX_FILES} files. You tried to add ${excessCount}.`);
      setTimeout(() => setTempError(""), 2000);
      return;
    }

    const readers = Array.from(droppedFiles).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((loadedFiles) => {
      setFiles((prev) => [...prev, ...loadedFiles]);
      setImageTexts((prev) => [...prev, ...Array(loadedFiles.length).fill(null)]);
      setEncryptionKeys((prev) => [...prev, ...Array(loadedFiles.length).fill(null)]);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setImageTexts((prev) => prev.filter((_, i) => i !== index));
    setEncryptionKeys((prev) => prev.filter((_, i) => i !== index));
    setHiddenImageIndices((prev) => prev.map(idx => idx !== null && idx > index ? idx - 1 : idx));
    setTextImageIndices((prev) => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const handleRemoveHiddenFile = (index: number) => {
    setHiddenFiles((prev) => prev.filter((_, i) => i !== index));
    setHiddenImageIndices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageSelection = (hiddenIndex: number, value: string) => {
    const newIndex = value === "" ? null : parseInt(value);
    const newHiddenIndices = [...hiddenImageIndices];
    newHiddenIndices[hiddenIndex] = newIndex;
    setHiddenImageIndices(newHiddenIndices);
  };

  const handleAddText = () => {
    if (textImageIndices.length >= MAX_TEXTS) {
      setTempError(`You can only add text to a maximum of ${MAX_TEXTS} images.`);
      setTimeout(() => setTempError(""), 2000);
      return;
    }
    setIsTextModalOpen(true);
  };

  const handleTextImageSelection = (index: number) => {
    setTextImageIndices((prev) => [...prev, index]);
    setIsTextModalOpen(false);
  };

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...imageTexts];
    newTexts[index] = value || null;
    setImageTexts(newTexts);
    if (!value) {
      setTextImageIndices((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleRemoveText = (index: number) => {
    setTextImageIndices((prev) => prev.filter((i) => i !== index));
    const newTexts = [...imageTexts];
    newTexts[index] = null;
    setImageTexts(newTexts);
  };

  const handleEncryptionChange = (index: number, value: string) => {
    const newKeys = [...encryptionKeys];
    newKeys[index] = value || null;
    setEncryptionKeys(newKeys);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("⚠️ Please upload at least one file.");
      return;
    }

    if (hiddenFiles.length > 0 && hiddenImageIndices.some(idx => idx === null)) {
      setError("⚠️ Please select an image for each hidden file.");
      return;
    }

    const allImagesHaveKeys = files.every((_, index) => 
      encryptionKeys[index] !== null && encryptionKeys[index] !== ""
    );

    if (!allImagesHaveKeys) {
      const missingKeyIndex = files.findIndex((_, index) => 
        encryptionKeys[index] === null || encryptionKeys[index] === ""
      );
      setError(`⚠️ Please assign an encryption key to Image ${missingKeyIndex + 1}.`);
      return;
    }

    const imagesWithContent = new Set([
      ...textImageIndices.filter(index => imageTexts[index] !== null && imageTexts[index] !== ""),
      ...hiddenImageIndices.filter(idx => idx !== null),
    ]);

    const allImagesHaveContent = files.every((_, index) => imagesWithContent.has(index));

    if (!allImagesHaveContent) {
      const missingContentIndex = files.findIndex((_, index) => !imagesWithContent.has(index));
      setError(`⚠️ Please assign text or a hidden file to Image ${missingContentIndex + 1}.`);
      return;
    }

    try {
      const encodedImages: EncodedImage[] = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].startsWith("data:image")) {
          let combinedMessage = "";
          const key = encryptionKeys[i]!;
          if (imageTexts[i]) {
            combinedMessage += encryptData(imageTexts[i], key);
          }
          const hiddenFileIndex = hiddenImageIndices.findIndex(idx => idx === i);
          if (hiddenFileIndex !== -1) {
            if (combinedMessage) combinedMessage += DELIMITER;
            combinedMessage += encryptData(hiddenFiles[hiddenFileIndex], key);
          }
          if (combinedMessage) {
            const encodedImage = await encodeImageMessage(files[i], combinedMessage);
            encodedImages.push({ 
              data: encodedImage, 
              index: i,
              hiddenFileIndex: hiddenFileIndex !== -1 ? hiddenFileIndex : undefined 
            });
          }
        }
      }

      files.forEach((file, index) => {
        const encodedVersion = encodedImages.find(img => img.index === index);
        const a = document.createElement("a");
        if (encodedVersion) {
          a.href = encodedVersion.data;
          a.download = encodedVersion.hiddenFileIndex !== undefined 
            ? `encoded_hidden_${encodedVersion.hiddenFileIndex + 1}.png` 
            : `encoded_text_${index + 1}.png`;
        } else {
          a.href = file;
          a.download = `image_${index + 1}.png`;
        }
        a.click();
      });

      setSuccess("✅ Successfully downloaded all files!");
      setTimeout(() => {
        setFiles([]);
        setHiddenFiles([]);
        setImageTexts([]);
        setEncryptionKeys([]);
        setError("");
        setSuccess("");
        setHiddenImageIndices([]);
        setTextImageIndices([]);
        if (typeof window !== "undefined") {
          localStorage.clear();
        }
      }, 2000);
    } catch (error) {
      setError("❌ Error processing one of the files: " + error);
    }
  };

  const getAvailableTextImages = () => {
    return files
      .map((file, index) => ({ file, index }))
      .filter(item => 
        item.file.startsWith("data:image") && 
        !textImageIndices.includes(item.index)
      );
  };

  const getAvailableHiddenImages = () => {
    return files
      .map((file, index) => ({ file, index }))
      .filter(item => 
        item.file.startsWith("data:image") && 
        !hiddenImageIndices.includes(item.index)
      );
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
              Add your <strong className="text-red-400">files</strong> and the{" "}
              <strong className="text-red-400">message</strong> to{" "}
              <strong className="bg-gradient-to-r from-stone-500 to-stone-700 bg-clip-text text-transparent">
                hide
              </strong>
            </>
          )}
        </p>
        <Card
          isBlurred
          className="max-w-lg w-full mx-auto p-6 my-12 border-2 border-dotted border-gray-400 rounded-lg shadow-xl bg-gray-50 dark:bg-gray-900"
        >
          <div
            className="flex flex-col items-center justify-center w-full min-h-48 cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {tempError && <div className="text-red-500 mb-2">{tempError}</div>}
            {files.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 w-full max-h-40 overflow-y-auto mb-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative text-center group">
                      {file.startsWith("data:image") ? (
                        <div className="relative">
                          <Image
                            src={file}
                            alt={`Uploaded Image ${index + 1}`}
                            className="w-full h-auto rounded-md transition-all duration-300 group-hover:brightness-75"
                          />
                          <button
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-md w-20 h-8 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-sm shadow-md"
                            onClick={() => handleRemoveFile(index)}
                          >
                            Remove
                          </button>
                          <span className="block mt-1 text-sm text-gray-500">
                            Image {index + 1}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500">File {index + 1}</p>
                      )}
                    </div>
                  ))}
                </div>
                {files.length < MAX_FILES && (
                  <Button onClick={() => fileInputRef.current?.click()} className="bg-gray-800 text-white w-full">
                    Add More
                  </Button>
                )}
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="text-center text-gray-500 border-2 border-dotted border-gray-400 rounded-lg p-6 w-full"
              >
                Click here or drag & drop up to 4 files
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

          {/* Encryption Key Inputs Moved Here */}
          {files.length > 0 && (
            <div className="w-full mb-4">
              {files.map((_, index) => (
                <Input
                  key={index}
                  fullWidth
                  size="lg"
                  label={`Encryption Key for Image ${index + 1}`}
                  placeholder={`Enter encryption key for Image ${index + 1}`}
                  value={encryptionKeys[index] || ""}
                  onChange={(e) => handleEncryptionChange(index, e.target.value)}
                  className="text-black mb-4"
                  variant="bordered"
                  color="primary"
                  classNames={{
                    input: "text-black dark:text-white",
                    label: "text-gray-500 dark:text-gray-400",
                    inputWrapper: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow",
                  }}
                />
              ))}
            </div>
          )}

          <Button
            onClick={handleAddText}
            className="bg-gray-800 text-white w-full mb-4"
          >
            {textImageIndices.length === 0 ? "Add Text" : "Add More Text"}
          </Button>

          {textImageIndices.map((index) => (
            <div key={index} className="relative mb-4">
              <Textarea
                fullWidth
                size="lg"
                label={`Text for Image ${index + 1}`}
                placeholder={`Enter text to hide in Image ${index + 1}`}
                className="text-black"
                value={imageTexts[index] || ""}
                onChange={(e) => handleTextChange(index, e.target.value)}
              />
              <Button
                isIconOnly
                color="danger"
                className="absolute top-2 right-2 z-10 h-9"
                onClick={() => handleRemoveText(index)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6h18M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2M5 6h14v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6z"
                  />
                </svg>
              </Button>
            </div>
          ))}

          <Modal isOpen={isTextModalOpen} onClose={() => setIsTextModalOpen(false)}>
            <ModalContent>
              <ModalHeader>Select Image for Text</ModalHeader>
              <ModalBody>
                {getAvailableTextImages().length > 0 ? (
                  getAvailableTextImages().map(({ index }) => (
                    <Button
                      key={index}
                      onClick={() => handleTextImageSelection(index)}
                      className="bg-gray-700 text-white w-full mb-2"
                    >
                      Image {index + 1}
                    </Button>
                  ))
                ) : (
                  <p>No available images to add text.</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button onClick={() => setIsTextModalOpen(false)} className="bg-red-500 text-white">
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-2">Hide Image Inside Image Max 4 (Optional)</label>
            <div className="relative">
              <input
                type="file"
                ref={hiddenFileInputRef}
                accept="image/*"
                multiple
                onChange={handleHiddenFileChange}
                className="hidden"
              />
              <Button
                onClick={() => hiddenFileInputRef.current?.click()}
                className="bg-gray-800 text-white w-full"
              >
                {hiddenFiles.length === 0 ? "Choose File" : `Choose File (${hiddenFiles.length} selected)`}
              </Button>
            </div>
            {hiddenFiles.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {hiddenFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="relative">
                      <Image
                        src={file}
                        alt={`Hidden Image ${index + 1}`}
                        className="w-full h-auto rounded-md transition-all duration-300 group-hover:brightness-75"
                      />
                      <button
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-md w-20 h-8 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-sm shadow-md"
                        onClick={() => handleRemoveHiddenFile(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <span className="block mt-1 text-sm text-gray-300">
                      Image {index + 1}
                    </span>
                    <Select
                      label={`Select image for Image ${index + 1}`}
                      placeholder={hiddenImageIndices[index] !== null ? `Image ${hiddenImageIndices[index]! + 1}` : "Choose an image"}
                      onChange={(e) => handleImageSelection(index, e.target.value)}
                      className="mt-2"
                    >
                      {getAvailableHiddenImages().map(({ index: fileIndex }) => (
                        <SelectItem key={fileIndex} value={fileIndex.toString()}>
                          Image {fileIndex + 1}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                ))}
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

export default Encode;