import { useState } from "react";
import './index.css';

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [value, setValue] = useState('');
  const [response, setResponse] = useState('');

  const questions = [
    "What is in the image?",
    "Does the image contain any animals?",
    "Where was this photo taken?",
    "Is the image in color or black and white?",
    "Are there any people in the image?",
    "What time of day was this photo taken?",
    "Is there text in the image?",
    "What emotions does the image evoke?",
    "What is the main subject of the photo?",
    "Does the image show a natural or urban environment?"
  ];

  const handleSurprise = () => {
    const randomValue = questions[Math.floor(Math.random() * questions.length)];
    setValue(randomValue);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image first!");
      return;
    }

    const data = {
      message: value
    }

    const formData = new FormData()
    formData.append('file', image)
    formData.append('data', JSON.stringify(data))

    try {

      const options = {
        method: 'POST',
        body: formData
      }

      const res = await fetch('http://localhost:8000/gemini', options)
      const data = await res.text()
      setResponse(data);

    } catch (error) {
      console.log(error);

    }

  };

  return (
    <div className="app">
      <section id="image">
        {image && (
          <figure>
            <img src={URL.createObjectURL(image)} alt="Uploaded Image" />
          </figure>
        )}
      </section>

      <form onSubmit={handleSubmit}>
        <div className="imageSection">
          <label htmlFor="files" className="para">Upload an Image & ask a question about it</label>
          <input
            hidden
            type="file"
            id="files"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <div className="surpriseSection">
          <p className="para">What do you want to know about the image?</p>
          <p className="surpriseButton" onClick={handleSurprise}>Surprise me</p>
        </div>

        <div className="askme">
          <input
            value={value}
            type="text"
            id="data"
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit">Ask me</button>
        </div>
      </form>

      {response && <p className="response">{response}</p>}
    </div>
  );
}

export default App;
