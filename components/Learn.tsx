import React from "react";

const Learn = () => {
  return (
    <div className="container mx-auto px-4 py-20 relative z-30">
      <p className="text-3xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 text-center">
        Learn about <strong>Stagno</strong>
      </p>

      <div className="mt-8 space-y-6">
        {[
          {
            title: "🧐 What is Steganography?",
            content:
              "Steganography is the practice of hiding information within other non-secret data. Unlike encryption, which makes data unreadable without a key, steganography hides the existence of the information itself. Stagno allows you to embed secret messages inside images securely.",
          },
          {
            title: "🎯 Purpose of Stagno",
            content:
              "Stagno provides a secure way to encode your sensitive messages inside an image, ensuring the message remains hidden from prying eyes. With lossless image encoding, the output images appear unchanged while secretly storing the data.",
          },
          {
            title: "🔐 How to Use Stagno",
            content: (
              <>
                <p className="text-lg font-medium text-white">1️⃣ Encoding a Message</p>
                <p className="text-neutral-400">
                  - Upload a lossless image (PNG or BMP).<br />
                  - Enter your secret message.<br />
                  - Click "Encode" and download the processed image.
                </p>
                <p className="text-lg font-medium text-white mt-3">2️⃣ Decoding a Message</p>
                <p className="text-neutral-400">
                  - Upload the encoded image.<br />
                  - Click "Decode" to extract your hidden message.
                </p>
              </>
            ),
          },
          {
            title: "✅ Why Use Stagno?",
            content: (
              <>
                <strong className="text-white">✔ Simple, Secure, and Fast:</strong> Easy-to-use interface with Least Significant Bit (LSB) encoding.
                <br />
                <strong className="text-white">📈 Advanced Features:</strong> Optional AES encryption for additional security.
              </>
            ),
          },
          {
            title: "📌 Use Cases",
            content: (
              <>
                - Secure Communication: Hide sensitive messages without detection.<br />
                - Watermarking: Embed invisible copyright protection.<br />
                - Covert Data Transfer: Send hidden information discreetly.<br />
                - Digital Signatures: Verify image authenticity.
              </>
            ),
          },
          {
            title: "⚙ How It Works",
            content:
              "Stagno uses Least Significant Bit (LSB) encoding. It replaces the least important pixel bits with message bits, making changes imperceptible to the human eye.",
          },
        ].map((section, index) => (
          <div key={index} className="border border-neutral-700 bg-neutral-900 p-6 rounded-xl shadow-lg">
            <p className="text-xl font-semibold text-white">{section.title}</p>
            <p className="text-lg text-neutral-400 mt-2">{section.content}</p>
          </div>
        ))}
        
        <div className="border border-neutral-700 bg-neutral-900 p-6 rounded-xl shadow-lg">
          <p className="text-xl font-semibold text-white">❓ Frequently Asked Questions (FAQ)</p>
          <div className="mt-4 space-y-4">
            {[
              {
                question: "🔹 Is my message safe in the image?",
                answer:
                  "Yes! The message is hidden in the least significant bits. For added security, combine it with AES encryption.",
              },
              {
                question: "🔹 Can I use any image format?",
                answer:
                  "PNG and BMP are recommended since they are lossless formats. JPEG is not ideal due to compression.",
              },
              {
                question: "🔹 How long can my message be?",
                answer: "The size depends on the image resolution. Larger images can store more data.",
              },
              {
                question: "🔹 What if my message is too long?",
                answer: "If the message exceeds the image capacity, you’ll need a larger image or a shorter message.",
              },
            ].map((faq, index) => (
              <div key={index} className="border border-neutral-700 bg-neutral-800 p-4 rounded-lg shadow-md">
                <p className="text-lg font-medium text-white">{faq.question}</p>
                <p className="text-neutral-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-neutral-700 bg-neutral-900 p-6 rounded-xl shadow-lg">
          <p className="text-xl font-semibold text-white">🚀 Ready to Get Started?</p>
          <p className="text-lg text-neutral-400">
            Head over to the Encode or Decode pages to try Stagno. Secure your messages effortlessly!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Learn;
