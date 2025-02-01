import { useState } from "react";
import axios from "axios";
import { FiSearch, FiDownload } from "react-icons/fi"; 

function App() {
    const [url, setUrl] = useState("");
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showImages, setShowImages] = useState(true); 
    const [showVideos, setShowVideos] = useState(true); 

    const fetchMedia = async () => {
        if (!url) return alert("Please enter a valid URL");
        setLoading(true);

        try {
            const response = await axios.get(`https://webpage-media-extractor.onrender.com/scrape?url=${encodeURIComponent(url)}`);
            setMedia(response.data.media);
        } catch (error) {
            console.error(error);
            alert("Error fetching media");
        }

        setLoading(false);
    };

    const filteredMedia = media.filter(item => {
        if (item.type === "image" && showImages) return true;
        if (item.type === "video" && showVideos) return true;
        return false;
    });

    const handleDownload = (url, type) => {
        if (type === 'image' && url.endsWith('.svg')) {
            axios.get(url, { responseType: 'text' })
                .then(response => {
                    const blob = new Blob([response.data], { type: 'image/svg+xml' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = url.substring(url.lastIndexOf("/") + 1);
                    link.click();
                })
                .catch(error => {
                    console.error("Error downloading SVG", error);
                });
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = url.substring(url.lastIndexOf("/") + 1);
            link.click();
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-5 py-10">
            <h1 className="text-4xl font-bold text-blue-400 mb-6">Webpage Media Extractor</h1>

            <div className="w-full max-w-2xl flex items-center gap-3 bg-gray-800 p-4 rounded-xl shadow-lg">
                <input
                    type="text"
                    placeholder="Enter webpage URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    onClick={fetchMedia}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg flex items-center gap-2 text-white transition-all duration-200 disabled:bg-gray-600"
                >
                    {loading ? (
                        <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
                    ) : (
                        <>
                            <FiSearch />
                            Extract
                        </>
                    )}
                </button>
            </div>

            <div className="mt-6 flex gap-6">
                <button
                    onClick={() => setShowImages(!showImages)}
                    className={`px-6 py-2 rounded-lg text-white ${showImages ? "bg-blue-500" : "bg-gray-600"}`}
                >
                    {showImages ? "Hide Images" : "Show Images"}
                </button>
                <button
                    onClick={() => setShowVideos(!showVideos)}
                    className={`px-6 py-2 rounded-lg text-white ${showVideos ? "bg-blue-500" : "bg-gray-600"}`}
                >
                    {showVideos ? "Hide Videos" : "Show Videos"}
                </button>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {filteredMedia.length > 0 ? (
                    filteredMedia.map((item, index) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md hover:scale-105 transition-all duration-300">
                            {item.type === "image" ? (
                                <>
                                    <img
                                        src={item.url}
                                        alt="Extracted"
                                        className="w-full h-60 object-cover rounded-lg transition-transform transform hover:scale-105"
                                    />
                                    <button
                                        onClick={() => handleDownload(item.url, item.type)}
                                        className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white flex items-center justify-center"
                                    >
                                        <FiDownload className="mr-2" />
                                        Download
                                    </button>
                                </>
                            ) : item.type === "video" ? (
                                <>
                                    <video
                                        src={item.url}
                                        controls
                                        className="w-full h-60 rounded-lg"
                                    ></video>
                                    <button
                                        onClick={() => handleDownload(item.url, item.type)}
                                        className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white flex items-center justify-center"
                                    >
                                        <FiDownload className="mr-2" />
                                        Download
                                    </button>
                                </>
                            ) : item.type === "iframe" ? (
                                <iframe
                                    src={item.url}
                                    className="w-full h-60 rounded-lg"
                                    allowFullScreen
                                ></iframe>
                            ) : null}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center col-span-full">
                        No media found. Try another link.
                    </p>
                )}
            </div>
        </div>
    );
}

export default App;
