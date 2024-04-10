import { useEffect, useState } from 'react';
import { BERTModelPipeline } from './llm';
import TheLoader from "react-spinners/GridLoader";
import './App.css';

export default function Home() {

  // CORE VARIABLES
  const [model, setModel] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [history, setHistory] = useState(localStorage.getItem('history')?.split('<@>') || [])

  // MAIN STATE VARIABLES
  const [mainString, setMainString] = useState('');
  const [wordPredictions, setWordPredictions] = useState(['']);

  // HELPER VARIABLES
  const [wordIndex, setWordIndex] = useState(0);
  const [bgImageUrl, setBgImageUrl] = useState(localStorage.getItem('bg-image-url') || 'https://www.wallpaperflare.com/static/874/68/846/mountains-peaks-snow-covered-snow-wallpaper.jpg');

  useEffect(() => {
    (async () => {
      const m = new BERTModelPipeline();
      await m.loadModel();
      setIsModelLoaded(true);
      setModel(m);
    })()
  }, [])

  const appendHistory = (s) => {
    const delimeter = "<@>"
    let history = localStorage.getItem('history');
    setHistory(prev => [s, ...prev])
    if (history) {
      localStorage.setItem('history', history + delimeter + s);
    } else {
      localStorage.setItem('history', s);
    }
  }

  const predictNextWord = async (s) => {
    const res = await model.predict(s ? s : mainString);
    setWordPredictions(res);
    setWordIndex(0);
  }

  const appendWord = (word) => {
    let _x;
    if (word.slice(0, 2) === "##") {
      _x = mainString.trim() + word.slice(2, word.length);
    } else {
      _x = mainString + word;
    }
    setMainString(prev => _x + ' ');
    predictNextWord(_x);
  }

  return (
    <main
      style={{
        padding: history.length === 0 ? "0 0" : "130px 0",
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: "100vh",
        maxWidth: '100vw',
        display: 'flex',
        gap: '100px',
        margin: 0,
        ...(bgImageUrl ? {
          backgroundImage: `url(${bgImageUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: "cover"
        } : {})
      }}
    >
      {isModelLoaded ? (<div style={{
        justifyContent: 'space-around',
        backdropFilter: "blur(20px)",
        backgroundColor: "#FFF5",
        flexDirection: 'column',
        borderRadius: "20px",
        alignItems: 'center',
        maxWidth: '100vw',
        display: 'flex',
        padding: "20px",
        height: "70vh",
        width: '80vw',
      }}>
        <div style={{ fontSize: "clamp(60px,5vw,100px)", textAlign: "center" }}>Top prediction :{' '}
          <span style={{ color: 'cyan' }}>
            {wordPredictions[0]?.token_str}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", gap: "20px" }}>
          {wordPredictions[0] !== '' ? wordPredictions.map((ele, idx) =>
            <button
              key={idx}
              className='button-16'
              style={{
                fontSize: "20px",
                backgroundColor: wordIndex === idx ? 'cyan' : "#EEE",
                padding: "10px 15px",
                fontSize: "33px"
              }}
              onClick={() => appendWord(ele.token_str)}
            >
              {ele.token_str}
            </button>
          ) : null}
        </div>
        <input
          id="mainInputField"
          value={mainString}
          autoComplete="off"
          type="text"
          placeholder='Search...'
          style={{
            backgroundColor: '#EEE',
            borderRadius: '10px',
            fontSize: '30px',
            padding: '20px',
            width: '60%',
          }}
          onKeyDown={(e) => {
            if (e.code === 'Tab') {
              e.preventDefault();
              appendWord(wordPredictions[wordIndex].token_str);
            } else if (e.code === 'Enter') {
              if (mainString.trim() === '') {
                return
              }
              const search_query = `https://www.google.com/search?q=` + mainString.replace(' ', '+')
              appendHistory(mainString);
              window.open(search_query);
            } else if (e.code === 'ArrowUp') {
              setWordIndex(prev => prev + 1 >= wordPredictions.length ? 0 : prev + 1);
            } else if (e.code === 'ArrowDown') {
              setWordIndex(prev => prev - 1 < 0 ? wordPredictions.length - 1 : prev - 1);
            }
          }}
          onChange={(e) => {
            if (e.target.value[e.target.value.length - 1] === ' ') {
              predictNextWord();
            }
            setMainString(e.target.value);
          }}
        />
        <div style={{ textAlign: 'center', fontSize: '18px', lineHeight: "20px" }}>
          <p><kbd>Tab</kbd> to auto-complete</p>
          <p><kbd>Enter</kbd> to search</p>
        </div>
      </div>) : <TheLoader size={50} color='#60F7F0' />}
      {history.length > 0 ?
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "#F7F7F777", borderRadius: "20px", padding: "10px 20px", backdropFilter: "blur(50px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "300px" }}>
            <h1>History</h1>
            <button onClick={() => { localStorage.removeItem('history'); setHistory([]) }} style={{ backgroundColor: "coral", padding: "10px 20px", fontSize: "25px", height: "fit-content" }} className='button-16'>clear</button>
          </div>
          <ul style={{ fontSize: "30px" }}>
            {history.map((ele, idx) => <li key={idx}>{ele}</li>)}
          </ul>
        </div> : null}
    </main >
  );
}
