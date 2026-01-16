const input = document.getElementById("wordInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const result = document.getElementById("result");
const loader = document.getElementById("loader");
const historyList = document.getElementById("historyList");
const toggle = document.getElementById("themeToggle");
const clickSound = document.getElementById("clickSound");
const wodBox = document.getElementById("wod");

const API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// ---------- THEME ----------
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
});

// ---------- SOUND ----------
function playClick(){
  clickSound.currentTime = 0;
  clickSound.play();
}

// ---------- SEARCH ----------
searchBtn.addEventListener("click", ()=>{ playClick(); searchWord(); });
input.addEventListener("keypress", e=>{
  if(e.key==="Enter"){ playClick(); searchWord(); }
});

// ---------- CLEAR ----------
clearBtn.addEventListener("click", ()=>{
  playClick();
  input.value="";
  result.innerHTML="";
});

// ---------- WORD OF DAY ----------
const randomWords=["serendipity","ethereal","luminous","resilience","ephemeral"];
const todayWord = randomWords[Math.floor(Math.random()*randomWords.length)];
wodBox.innerHTML = `✨ Word of the Day: <b>${todayWord}</b>`;

// ---------- SEARCH HISTORY ----------
let history = JSON.parse(localStorage.getItem("history")) || [];
renderHistory();

function saveHistory(word){
  if(!history.includes(word)){
    history.unshift(word);
    history = history.slice(0,5);
    localStorage.setItem("history",JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory(){
  historyList.innerHTML="";
  history.forEach(w=>{
    const span=document.createElement("span");
    span.textContent=w;
    span.onclick=()=>{ input.value=w; searchWord(); };
    historyList.appendChild(span);
  });
}

// ---------- MAIN SEARCH ----------
function searchWord(){
  const word=input.value.trim();
  if(word===""){
    alert("Empty input? Even the dictionary is confused 😭");
    return;
  }

  loader.style.display="block";
  result.innerHTML="";

  fetch(API+word)
    .then(res=>{
      if(!res.ok) throw Error();
      return res.json();
    })
    .then(data=>{
      loader.style.display="none";
      showResult(data);
      saveHistory(word);
    })
    .catch(()=>{
      loader.style.display="none";
      result.innerHTML=`<p class="error">Word not found. Please try another word.</p>`;
    });
}

function showResult(data){
  const entry=data[0];
  const meaningObj=entry.meanings[0];
  const def=meaningObj.definitions[0];

  const phonetic=entry.phonetic||"Not available";
  const example=def.example||"Example not available";

  let audio="";
  if(entry.phonetics){
    const a=entry.phonetics.find(p=>p.audio);
    if(a) audio=a.audio;
  }

  result.innerHTML=`
    <h2>${entry.word}</h2>
    <i>${meaningObj.partOfSpeech}</i>

    <p><b>Phonetic:</b> ${phonetic}</p>
    <p><b>Meaning:</b> ${def.definition}</p>
    <p><b>Example:</b> ${example}</p>

    ${audio ? `<button class="audio-btn" onclick="playAudio('${audio}')">🔊 Play Audio</button>` : "<p>Audio not available</p>"}
  `;
}

function playAudio(src){
  playClick();
  new Audio(src).play();
}