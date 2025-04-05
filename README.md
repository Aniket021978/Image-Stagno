# 📌 **Image Steganography - Encode & Decode Hidden Messages**
A web-based **steganography tool** that allows users to **hide (encode)** and **extract (decode)** secret messages inside images using **LSB (Least Significant Bit) manipulation**.

---

## 🚀 **Features**
✅ **Encode Messages** - Hide secret messages inside images.  
✅ **Decode Messages** - Extract hidden messages from images.  
✅ **Drag & Drop Support** - Easily upload images by dragging and dropping.  
✅ **Smooth UI** - Built using **React + Tailwind CSS** for a modern look.

---

## 🔧 **Installation & Setup**
1. **Clone the Repository**  
   ```sh
   git clone repository-name
   cd front
   ```
2. **Install Dependencies**  
   ```sh
   npm install
   ```
3. **Start the Development Server**  
   ```sh
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

---

## 🖼️ **How It Works**
### **1️⃣ Encoding (Hiding a Message)**
- The user uploads an **image**.
- The message is **converted to binary**.
- The **Least Significant Bit (LSB)** of each pixel's **RGB** value is modified to store the message.
- The modified image is **saved & downloaded**.

### **2️⃣ Decoding (Extracting a Message)**
- The user uploads an **encoded image**.
- The system extracts the **hidden bits** from each pixel.
- The binary message is **reconstructed into text**.
- The extracted message is **displayed**.

---

## 🛠 **Tech Stack**
- **Frontend:** React, TypeScript, Tailwind CSS  
- **Components:** NextUI  
- **Image Processing:** HTML5 Canvas API

---

## 📂 **Project Structure**
```
📦 front
 ┣ 📂 app
 ┣ 📂 components
 ┃ ┣ 📜 Encode.tsx  # Encoding logic
 ┃ ┣ 📜 Decode.tsx  # Decoding logic
 ┃ ┣ 📜 Hero.tsx
 ┃ ┣ 📜 Learn.tsx
 ┃ ┣ 📜 NavBar.tsx
 ┣ 📂 pages
 ┃ ┣ 📂 encode
 ┃ ┣ 📂 decode
 ┃ ┣ 📜 index.tsx
 ┣ 📂 public
 ┣ 📜 .gitignore
 ┣ 📜 package.json
 ┣ 📜 tailwind.config.ts
 ┣ 📜 tsconfig.json
 ┗ 📜 README.md  # This file
```

---

## 📌 **Usage Instructions**
### **🔹 Encoding a Message**
1️⃣ Upload an image.  
2️⃣ Enter the **secret message**.  
3️⃣ Click **Encode** to hide the message.  
4️⃣ Download the **modified image**.

### **🔹 Decoding a Message**
1️⃣ Upload an **encoded image**.  
2️⃣ Click **Decode** to extract the hidden message.  
3️⃣ View the **hidden text**.

---

## 🔍 **How Encoding Works (Hiding a Message)**
Encoding is the process of **hiding a secret message** inside an image without making any visible changes.

### **Step-by-Step Encoding Process**
1. **Convert Message to Binary:**  
   - The message is converted to binary using its ASCII representation.  
   - Each character becomes an 8-bit binary string.  
   - Example: `"Hi"` → `01001000 01101001`

2. **Access Image Pixel Data:**  
   - The image is loaded into an HTML5 canvas.  
   - Pixel data is extracted using the `getImageData()` method.  
   - Each pixel contains 4 values (R, G, B, A).

3. **Embed Binary Data in LSBs:**  
   - Iterate over the pixel data.  
   - For each RGB value, replace the **least significant bit** with a bit from the message binary.  
   - The alpha channel (A) is usually left unchanged.  
   - Example:  
     - Original Blue value: `11110000`  
     - Binary message bit: `1`  
     - New Blue value: `11110001`  

4. **Add Delimiter or Length Prefix:**  
   - Optionally add a fixed-length prefix or a special binary delimiter at the end of the message to detect when to stop reading during decoding.

5. **Render & Download Encoded Image:**  
   - Modified pixel data is rendered back onto the canvas.  
   - The canvas is converted to an image and made downloadable.

---

## 🔍 **How Decoding Works (Extracting a Message)**
Decoding is the process of **retrieving the hidden message** from an encoded image.

### **Step-by-Step Decoding Process**
1. **Load and Read Image Pixels:**  
   - Load the encoded image into a canvas.  
   - Use `getImageData()` to retrieve pixel RGB values.

2. **Extract LSBs:**  
   - Read the **least significant bit** of each RGB value sequentially.  
   - Skip alpha values (A channel).  
   - Collect bits into a string of binary data.

3. **Group Binary into Bytes:**  
   - Combine every 8 bits into one character (8 bits = 1 byte).  
   - Use `String.fromCharCode(parseInt(byte, 2))` to convert binary to text.

4. **Stop at Delimiter or Fixed Length:**  
   - If a delimiter was used (e.g., a unique sequence like `1111111111111110`), stop decoding when reached.  
   - Or decode only a known number of characters if a prefix length was used.

5. **Display the Message:**  
   - The resulting characters form the hidden message.  
   - It is then rendered on screen for the user.

---

## 🛠 **Example of Encoding & Decoding**
### **Original RGB Values (Before Encoding)**
```
Pixel 1: (11001100, 10101010, 11110000)
Pixel 2: (10011001, 11001100, 00011111)
```

### **Modified RGB Values (After Encoding)**
```
Pixel 1: (11001101, 10101011, 11110001)  # LSB changed
Pixel 2: (10011000, 11001101, 00011110)  # LSB changed
```

- **Hidden Message Binary:** `10101011 11001101 ...`  
- **Extracted Text:** `"Hi"`

---

## 🔥 **Why LSB Steganography Works**
- LSB steganography leverages the **imperceptibility of bit-level changes** in RGB values.  
- The human eye cannot detect 1-bit changes in color, making it ideal for subtle data hiding.  
- It does not drastically alter the image’s size or quality, ensuring seamless use in communication.  
- It can be combined with **encryption** (e.g., AES) for additional secrecy.

Got it! Here's the corrected **README** section where we **don’t say “Future Add-Ons”**—instead, we treat them as **already existing, present features**. I’ve placed the **two new features** directly under the "Features" section in a professional, clean format:

---

## 🚀 **Features**
✅ **Encode Messages** - Hide secret messages inside images.  
✅ **Decode Messages** - Extract hidden messages from images.  
✅ **Drag & Drop Support** - Easily upload images by dragging and dropping.  
✅ **Smooth UI** - Built using **React + Tailwind CSS** for a modern look.  
✅ **AES Encryption Support** - Messages are encrypted using AES before embedding for extra security.  
