/**
 * youtube.js
 * 
 * This file contains the core functions for the panel embeded into YouTube video pages. Feature include:
 * - Inserting a panel to the side of the video player
 * - Handling transcript fetching and querying with LLM API
 * - Displaying and recording selections from a vocab selection screen
 * - Monitoring video time to display chunks
 * - Handling header button features: copy/paste, in-player notificaitions, etc
 * - Launching quiz screen at the end of the video
 * 
 * The main purpose is to provide users with easy review of vocab as they watch videos,
 * improving their overall language learning experience.
 */

"use strict";


import { getLangOptionsWithLink, getTranscriptHTML, getRawTranscript, convertIntToHms } from "./transcript.js";
import { getSearchParam } from "./searchParam.js";
import { copyTextToClipboard } from "./copy.js";
import { getVocabTerms } from "./queryAPI.mjs";
import { toggleVocabList } from "./vocabList.js"; 

let vocabPanelLoaded = false; // Track if the vocab panel is loaded

let selectionDone = false; // Track if word selection is done
let transcriptChunks = []; // Store transcript data globally
let currentChunkIndex = -1; // Track which chunk is currently displayed
let chunkDisplaying = false; // Track if a chunk is currently displayed
let chunksToGo = -1; // Track how many chunks are left to display
let lastDisplayedTime = 0; // Track the last timestamp a chunk was displayed


// Global variables for vocab selection
const keywords = [];
const translatedWords = [];

// Global variables for in-player notifications
let allOriginalTerms = []; 
let allEnglishTerms = []; 
let detectedLanguage = ""; 
let subtitlesEnabled = false;
let subtitleOverlay = null;

export function insertVocabPanel() {
    
    // Sanitize Transcript Div
    if (document.querySelector("#langage_lang_select")) { document.querySelector("#langage_lang_select").innerHTML = ""; }
    Array.from(document.getElementsByClassName("langage_container")).forEach(el => { el.remove(); });

    if (!getSearchParam(window.location.href).v) { return; }

    waitForElm('video').then(video => {
        video.pause();
    });

    waitForElm('#secondary.style-scope.ytd-watch-flexy').then(() => {

        // Sanitize
        Array.from(document.getElementsByClassName("langage_container")).forEach(el => { el.remove(); });

        // Place Script Div
        document.querySelector("#secondary.style-scope.ytd-watch-flexy").insertAdjacentHTML("afterbegin", `
        <div class="langage_container">
            <div id="langage_header" class="langage_header">
                <div class="langage_header_action_btn header-button-hover-el langage_icon" data-hover-label="Watch our demo video!" href="https://youtu.be/zoToloyLYDc" target="_blank" style="width: 24px;height: 24px;">
                    <svg style="filter: brightness(0.9);" width="24" height="24" viewBox="0 0 128 128" fill="red" xmlns="http://www.w3.org/2000/svg">
                        <!-- Onigiri Triangle -->
                        <path d="M16,100 L64,16 L112,100 Z" stroke="black" stroke-width="4" fill="#fdba5d"/>
                        
                        <!-- Face -->
                        <circle cx="64" cy="80" r="10" stroke="black" stroke-width="4" fill="none"/>
                        <path d="M74,70 Q80,60 86,70" stroke="black" stroke-width="4" fill="none"/>
                        <path d="M48,100 Q64,110 80,100" stroke="black" stroke-width="4" fill="none"/>
                        <path d="M 42.088 69.611 C 46.088 62.443 50.088 62.443 54.088 69.611" stroke="black" stroke-width="4" fill="none" style=""/>
                        
                        <!-- Wings -->
                        <path d="M20,70 Q10,60 15,50 Q20,40 30,50 Q40,60 30,70 Q20,80 20,70" stroke="black" stroke-width="4" fill="#fdba5d"/>
                        <path d="M108,70 Q118,60 113,50 Q108,40 98,50 Q88,60 98,70 Q108,80 108,70" stroke="black" stroke-width="4" fill="#fdba5d"/>
                        
                        <!-- Onigiri Knot -->
                        <path d="M60,20 Q64,14 68,20" stroke="#059669" stroke-width="4" fill="none"/>
                    </svg>
                </div>
                <p class="langage_header_text" href="https://docs.google.com/document/d/1W-YhnBGYRKQQXwsacz95ba6MvLcF2vRikRFN4LP7wNw/edit?usp=sharing" target="_blank">LanGage Learning</p>
                <div class="langage_header_actions">
                    <div id="langage_header_summary" class="langage_header_action_btn header-button-hover-el langage_icon" data-hover-label="Show/Hide Vocab">
                        <svg style="filter: brightness(0.9);" class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="#828282" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6h8m-8 6h8m-8 6h8M4 16a2 2 0 1 1 3.321 1.5L4 20h5M4 5l2-1v6m-2 0h4"/>
                        </svg>
                    </div>
                    <div id="langage_header_copy" class="langage_header_action_btn header-button-hover-el langage_icon" data-hover-label="Copy Vocab List\nto Clipboard">
                        <svg style="filter: brightness(0.9);" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 6.6V5C7 4.44772 7.44772 4 8 4H18C18.5523 4 19 4.44772 19 5V16C19 16.5523 18.5523 17 18 17H16.2308" stroke="#828282" stroke-width="1.5"/>
                            <rect x="4.75" y="6.75" width="11.5" height="13.5" rx="1.25" stroke="#828282" stroke-width="1.5"/>
                        </svg>
                    </div>
                    <div id="langage_header_cc" class="langage_header_action_btn header-button-hover-el langage_icon" data-hover-label="Toggle in-player notifications">
                        <span>CC</span>
                    </div>
                    <div style="filter: brightness(0.9);" id="langage_header_instructions" class="langage_header_action_btn header-button-hover-el langage_icon" data-hover-label="Need help?\n(click for\ninstructions)">
                    </div>
                    <div id="langage_header_profile" class="langage_header_action_btn header-button-hover-el langage_icon" data-hover-label="My Profile\n(Coming Soon)">
                        <svg style="filter: brightness(0.9);" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="3.25" stroke="#828282" stroke-width="1.5"/>
                            <path d="M5.75 18.25C5.75 15.3505 8.10051 13 11 13H13C15.8995 13 18.25 15.3505 18.25 18.25V19.25H5.75V18.25Z" stroke="#828282" stroke-width="1.5"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div id="langage_body" class="langage_body">
                <div id="langage_lang_select" class="langage_lang_select"></div>
                <div id="langage_text" class="langage_text"></div>
                <div id="langage_vocab_list" class="langage_vocab_list" style="display: none;"></div>
            </div>
        </div>`);
        
        // Immediately expand the transcript on page load
        sanitizeWidget();

        // Trigger transcript fetching
        (async function autoOpenTranscript() {
            const videoId = getSearchParam(window.location.href).v;
            if (!videoId) return;

            // NOTE: We're not using langOptions right now, but it allows us to check noTranscriptionAlert()
            const langOptionsWithLink = await getLangOptionsWithLink(videoId);
            if (!langOptionsWithLink) {
                noTranscriptionAlert();
                return;
            }
            
            if (!vocabPanelLoaded) {
                // Create and display vocab selection buttons
                const rawTranscript = await displayWordSelection(langOptionsWithLink[0]);

                // Create and display transcript chunks
                transcriptChunks = await getTranscriptHTML(rawTranscript, videoId, keywords, translatedWords);
                
                // Mark panel as loaded, avoid re-fetching
                vocabPanelLoaded = true;
            }

            // Start checking the video time to update chunks
            monitorVideoTime();

            // Attach event listeners for timestamps 
            // -- NOTE: Not used right now since we have the time-synced chunks...
            // evtListenerOnTimestamp();

        })();

        document.querySelector("#langage_header_summary").addEventListener("click", () => {
            toggleVocabList(allOriginalTerms, allEnglishTerms, detectedLanguage);
        });

        // Add CC button event listener
        document.querySelector("#langage_header_cc").addEventListener("click", () => {
            subtitlesEnabled = !subtitlesEnabled;
            toggleSubtitleOverlay();
            updateCCButtonStyle();
        });

        // Handle fullscreen mode
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement && subtitleOverlay) {
                document.fullscreenElement.appendChild(subtitleOverlay);
            } else if (subtitleOverlay) {
                document.body.appendChild(subtitleOverlay);
            }
        });

        // Handle theater mode
        const player = document.querySelector('#player');
        if (player) {
            const observer = new MutationObserver(() => {
                if (player.classList.contains('ytp-theater-mode') && subtitleOverlay) {
                    player.appendChild(subtitleOverlay);
                } else if (subtitleOverlay) {
                    document.body.appendChild(subtitleOverlay);
                }
            });
            observer.observe(player, { attributes: true, attributeFilter: ['class'] });
        }

        // Event Listener: Hover Label
        Array.from(document.getElementsByClassName("header-button-hover-el")).forEach(el => {
            const label = el.getAttribute("data-hover-label");
            if (!label) { return; }
            el.addEventListener("mouseenter", (e) => {
                e.stopPropagation();
                e.preventDefault();
                Array.from(document.getElementsByClassName("langage_header_hover_label")).forEach(el => { el.remove(); })
                el.insertAdjacentHTML("beforeend", `<div class="langage_header_hover_label">${label.replace(/\n+/g, `<br />`)}</div>`);
            })
            el.addEventListener("mouseleave", (e) => {
                e.stopPropagation();
                e.preventDefault();
                Array.from(document.getElementsByClassName("langage_header_hover_label")).forEach(el => { el.remove(); })
            })
        })

        // Event Listener: Copy Vocab
        document.querySelector("#langage_header_copy").addEventListener("click", (e) => {
        const selectedWords = keywords.map((word, index) => `${word} (${translatedWords[index]})`).join(", ");
        if (selectedWords.length < 5) {
            alert("Please select all 5 words before copying.");
        } else {
            copyTextToClipboard(selectedWords);
        }
        })

        // Event Listener: Jump to Current Timestamp's Chunk
        // document.querySelector("#langage_header_track").addEventListener("click", (e) => {
        //     e.stopPropagation();
        //     scrollIntoCurrTimeDiv();
        // })

        // Event Listener: Display User Instructions Blurb/Alert
        document.getElementById("langage_header_instructions").addEventListener("click", displayInstructions);

    });

}

function isAdPlaying() {
    if (document.querySelector("div.ad-showing")) {
        return true;
    };
    return false;
}

async function displayWordSelection(langOption) {
    const link = langOption.link;
    const languageCode = langOption.languageCode;

    const transcriptContainer = document.getElementById("langage_text");

    while (isAdPlaying()) {
        transcriptContainer.innerHTML = `<p style="text-align: center; font-size: 16px; color: gray;">Waiting for ad to finish...</p>`;
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    transcriptContainer.innerHTML = "";

    const wordSelectionContainer = document.createElement("div");
    wordSelectionContainer.id = "word-selection-container";

    const title = document.createElement("h2");
    title.innerText = "Select 5 Words Below";
    title.classList.add("word-selection-title");
    wordSelectionContainer.appendChild(title);

    const subtitle = document.createElement("h4");
    subtitle.innerText = "to review during the video";
    subtitle.classList.add("word-selection-subtitle");
    wordSelectionContainer.appendChild(subtitle);

    const rawTranscript = await getRawTranscript(link);
    let textTogether = Array.from(rawTranscript).map(obj => obj.text).join(" ").replace(/\d+/g, "");
    const { originalTerms, englishTerms } = await getVocabTerms(textTogether);

    // Store all terms and language globally
    allOriginalTerms = originalTerms;
    allEnglishTerms = englishTerms;
    detectedLanguage = languageCode;

    let selectedOriginalTerms = [];
    let selectedEnglishTerms = [];

    const wordSelectionPromise = new Promise((resolve) => {
        englishTerms.forEach((word, index) => {
            const btn = document.createElement("button");
            btn.innerText = word;
            btn.classList.add("word-selection-btn");

            btn.addEventListener("click", () => {
                if (!selectedEnglishTerms.includes(word)) {
                    selectedEnglishTerms.push(word);
                    selectedOriginalTerms.push(originalTerms[index]);
                    btn.classList.add("selected");
                }

                if (selectedEnglishTerms.length === 5) {
                    document.getElementById("langage_text").innerHTML = "";
                    selectionDone = true;

                    const video = document.querySelector("video");
                    if (!video) return;
                    video.play();

                    resolve();
                }
            });
            wordSelectionContainer.appendChild(btn);
        });
    });

    document.getElementById("langage_text").innerHTML = "";
    document.getElementById("langage_text").appendChild(wordSelectionContainer);

    await wordSelectionPromise;

    keywords.length = 0;
    translatedWords.length = 0;
    keywords.push(...selectedOriginalTerms);
    translatedWords.push(...selectedEnglishTerms);

    return rawTranscript;
}

// Subtitle overlay functions
function createSubtitleOverlay() {
    if (subtitleOverlay) return;
    subtitleOverlay = document.createElement('div');
    subtitleOverlay.id = 'langage-subtitle-overlay';
    subtitleOverlay.style.position = 'absolute';
    subtitleOverlay.style.top = '10px';
    subtitleOverlay.style.right = '10px';
    subtitleOverlay.style.background = 'rgba(0,0,0,0.5)';
    subtitleOverlay.style.color = 'white';
    subtitleOverlay.style.padding = '5px';
    subtitleOverlay.style.zIndex = '1000';
    subtitleOverlay.style.display = 'none';
    document.body.appendChild(subtitleOverlay);
}

// Toggle subtitle overlay visibility
function toggleSubtitleOverlay() {
    if (!subtitleOverlay) createSubtitleOverlay();
    subtitleOverlay.style.display = subtitlesEnabled ? 'block' : 'none';
}

// Update CC button style based on subtitlesEnabled
function updateCCButtonStyle() {
    const ccButton = document.querySelector("#langage_header_cc");
    if (subtitlesEnabled) {
        ccButton.classList.add('bold');
    } else {
        ccButton.classList.remove('bold');
    }
}

// Function to get the current chunk based on the video time
function getCurrentChunk(currentTime) {
    return transcriptChunks.find(chunk => currentTime >= parseFloat(chunk.start) && currentTime < chunk.end);
}


// Function to update overlay position based on screen mode
function updateOverlayPosition(subtitleOverlay) {
    const videoPlayer = document.querySelector("#movie_player") || document.querySelector(".html5-video-player");
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;

    if (fullscreenElement) {
        // Fullscreen mode: Append to fullscreen element
        fullscreenElement.appendChild(subtitleOverlay);
    } else if (document.querySelector(".html5-video-player.ytd-watch-flexy[theater]")) {
        // Theater mode: Append to video player container
        videoPlayer.appendChild(subtitleOverlay);
    } else {
        // Standard mode: Append to video player container
        videoPlayer.appendChild(subtitleOverlay);
    }
}

function monitorVideoTime() {    
    // Reset the chunk display state (with the HTML and index)
    removeChunk(true, false);
    chunksToGo = transcriptChunks.length;

    const video = document.querySelector("video");
    if (!video) return;
    
    waitForElm('video').then(video => {
        video.play();
    });

    // Create or get subtitle overlay
    let subtitleOverlay = document.getElementById("langage-subtitle-overlay");
    if (!subtitleOverlay) {
        subtitleOverlay = document.createElement("div");
        subtitleOverlay.id = "langage-subtitle-overlay";
        updateOverlayPosition(subtitleOverlay); // Initial positioning
    }
    subtitleOverlay.style.display = "block";

    let notificationTimeout; // To manage notification duration

    video.addEventListener("timeupdate", () => {
        if (!selectionDone) return;

        // Ensure no chunks display while an ad is playing
        if (isAdPlaying()) {
            document.getElementById("langage_text").innerHTML = `<p style="text-align: center; font-size: 16px; color: gray;">Waiting for ad to finish...</p>`;
            return;
        }

        if (transcriptChunks.length === 0) {
            console.log("No transcript chunks available");
            return;
        }

        const currentTime = video.currentTime;
        
        // Special Case: handle when user rewinds the video to where a chunk was already displayed
        if (currentChunkIndex > 0 && currentTime < lastDisplayedTime) {
            resynchChunks(currentTime, currentChunkIndex);
        }
        let nextChunkIndex = currentChunkIndex + 1;

        // console.log("Current Time: ", convertIntToHms(Math.round(currentTime)));

        // Check if it's time to display next chunk
        if (nextChunkIndex < transcriptChunks.length) {
            let nextChunk = transcriptChunks[nextChunkIndex];
            let nextChunkStart = parseFloat(nextChunk.start);

            // console.log("Next Chunk Start: ", convertIntToHms(Math.round(chunkStart)));
            
            // Show chunk 5 seconds before startTime, unless prev chunk has not completed its scene
            if (!chunkDisplaying && currentTime >= nextChunkStart - 10) {
                // console.log("Displaying next chunk");
                displayChunk(nextChunkIndex);

                lastDisplayedTime = currentTime;
            }
        }

        // Special Case: handle the last chunk
        if (currentChunkIndex === transcriptChunks.length - 1) {
            let lastChunk = transcriptChunks[currentChunkIndex];
            let chunkStart = parseFloat(lastChunk.start);
        
            if (currentTime >= chunkStart + 10 || video.ended) {
                // console.log("Removing last chunk"); 
                removeChunk(false, true);
            }
        }

        // Check if it's time to remove next chunk (if there is more to display)
        if (currentChunkIndex >= 0 && chunksToGo > 0) {
            // let currentChunk = transcriptChunks[currentChunkIndex];
            let currentChunkStart = parseFloat(transcriptChunks[currentChunkIndex].start);

            nextChunkIndex = currentChunkIndex + 1;
            
            // Remove chunk if:
            // 1. The video reaches 10 seconds after the chunk's start time
            // 2. A new chunk needs to be displayed
            if (chunkDisplaying && (currentTime >= currentChunkStart + 10) || nextChunkIndex < transcriptChunks.length && currentTime >= parseFloat(transcriptChunks[nextChunkIndex].start)) {
                console.log("Removing current chunk");
                removeChunk();
            }
        }

        // Update subtitle overlay if enabled
        const currentChunk = getCurrentChunk(currentTime);

        if (subtitlesEnabled && currentChunk) {
            subtitleOverlay.textContent = `${currentChunk.keyword} [${currentChunk.translation}]`;
            updateOverlayPosition(subtitleOverlay); // Update position on each time update
            clearTimeout(notificationTimeout);
            notificationTimeout = setTimeout(() => {
                subtitleOverlay.textContent = "";
            }, 5000); // Display for 5 seconds
        } else {
            subtitleOverlay.textContent = "";
        }

        if (currentTime + 5  >= video.duration - 5) {
            initQuiz(); 
        }
        
    });
    // Handle fullscreen and theater mode changes
    document.addEventListener("fullscreenchange", () => updateOverlayPosition(subtitleOverlay));
    document.addEventListener("webkitfullscreenchange", () => updateOverlayPosition(subtitleOverlay));
    document.addEventListener("mozfullscreenchange", () => updateOverlayPosition(subtitleOverlay));

}

function displayChunk(index) {
    removeChunk(); // Remove any existing chunk

    if (currentChunkIndex === index) return; // Prevent redundant updates

    const chunk = transcriptChunks[index];
    document.getElementById("langage_text").innerHTML = chunk.chunk_html;

    // Insert the warning icon into the chunk
    const addtionalHTML = getTransparencyWarning();
    document.getElementById("langage_text").insertAdjacentHTML("beforeend", addtionalHTML);

    chunkDisplaying = true;
    currentChunkIndex = index;
}

function removeChunk(firstCheck=false, finalCheck=false) {
    if (!chunkDisplaying && !firstCheck) return; // Prevent unnecessary execution

    const transcriptContainer = document.getElementById("langage_text");

    // Display a message instead of wiping the content immediately
    if (firstCheck) {
        transcriptContainer.innerHTML = `
            <div class="transcript_placeholder" style="text-align: center; font-size: 16px; color: gray; padding: 10px;">
                Vocab scenes starting soon! 👀<br>Look out for the words: ${
                    keywords.length > 1 
                        ? keywords.slice(0, -1).join(", ") + " and " + keywords[keywords.length - 1] 
                        : keywords[0]
                }
            </div>
        `;
    }
    else if (finalCheck) {
        chunksToGo -= 1;
        transcriptContainer.innerHTML = `
            <div class="transcript_placeholder" style="text-align: center; font-size: 16px; color: gray; padding: 10px;">
                You saw all your vocab scenes! 🎉<br>Wait for your quiz at the end 📖. 
            </div>
        `;
    } else { 
        chunksToGo -= 1;
        transcriptContainer.innerHTML = `
            <div class="transcript_placeholder" style="text-align: center; font-size: 16px; color: gray; padding: 10px;">
                ${chunksToGo} more vocab scenes coming up... 🎬 <br>Look out for the words: ${
                    keywords.length > 1 
                        ? keywords.slice(0, -1).join(", ") + " and " + keywords[keywords.length - 1] 
                        : keywords[0]
                }
            </div>
        `;
    }

    chunkDisplaying = false; // Mark that no chunk is currently displayed
}

function resynchChunks(currentTime, currentIndex) {
    removeChunk();

    let syncedIndex = getResyncedIndex(currentTime);
    chunksToGo = chunksToGo + (currentIndex - syncedIndex + 1);
    currentChunkIndex = syncedIndex - 1;

    console.log("Resynched to chunk: ", currentChunkIndex);
}

function getResyncedIndex(rewoundTime) {
    let returningToIndex = 0;
    for (let i = 0; i < transcriptChunks.length; i++) {
        if (transcriptChunks[i].start <= rewoundTime) {
            returningToIndex = i;
        } else {
            break; // Stop as soon as we find a chunk with a larger start time
        }
    }
    return returningToIndex;
}

function startDynamicQuiz() {
    let currentWordIndex = 0;
    const answers = [];
    waitForElm('video').then(video => {
        video.pause();
    });

    function displayQuestion() {
        if (currentWordIndex < keywords.length) {
            const progress = (currentWordIndex / keywords.length) * 100;
            const quizHTML = `
                <div class="quiz-container">
                    <div class="quiz-progress-bar">
                        <div class="quiz-progress" style="width: ${progress}%"></div>
                    </div>
                    <div class="question-card">
                        <h2 class="quiz-title">Review your vocab words</h2>
                        <h3 class="quiz-question">Question ${currentWordIndex + 1} of ${keywords.length}</h3>
                        <p class="quiz-word-prompt">Define the word: <span class="highlight-quiz-word">${keywords[currentWordIndex]}</span></p>
                        <input type="text" id="definition-input" class="styled-quiz-input" placeholder="Enter definition">
                        <button id="submit-definition" class="quiz-btn">${currentWordIndex + 1 == keywords.length ? 'Submit' : 'Next Word'}</button>
                    </div>
                </div>
            `;
            document.querySelector("#langage_text").innerHTML = quizHTML;

            // Insert the warning icon separately after rendering the quiz
            const addtionalHTML = getTransparencyWarning();
            document.getElementById("langage_text").insertAdjacentHTML("beforeend", addtionalHTML);

            const inputField = document.querySelector("#definition-input");
            const submitButton = document.querySelector("#submit-definition");

            // Function to handle submission
            function submitAnswer() {
                const definition = inputField.value.trim();
                answers.push({ 
                    word: keywords[currentWordIndex], 
                    user_definition: definition,
                    hard_definition: translatedWords[currentWordIndex]
                });
                currentWordIndex++;
                displayQuestion();
            }

            // Click event for submit button
            submitButton.addEventListener("click", submitAnswer);

            // Enter key event for input field
            inputField.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault(); // Prevent form submission or page refresh
                    submitAnswer();
                }
            });

            // Auto-focus input field
            inputField.focus();
        } else {
            displayResults();
        }
    }

    function displayResults() {
        let resultsHTML = `
            <div class="quiz-container">
                <h2 class="results-title">🎉 Congratulations!</h2>
                <p>You've completed the quiz on ${keywords.length} keywords.</p>
                <p><b>Your answers:</b></p>
                <ul class="results-list">
        `;
    
        answers.forEach((answer, index) => {
            const isCorrect = answer.user_definition.trim().toLowerCase() === answer.hard_definition.trim().toLowerCase();
            const matchClass = isCorrect ? "correct-answer" : "user-answer";
    
            resultsHTML += `
                <li class="result-item">
                    <strong>${index + 1}) ${answer.word}:</strong> 
                    <span class="${matchClass}">Your answer: <b>${answer.user_definition}</b></span> 
                    <span class="correct-answer">Correct: <b>${answer.hard_definition}</b></span>
                </li>
            `;
        });
    
        resultsHTML += `
                </ul>
                <!-- Rating System -->
                <div class="rating-container">
                    <p><b>How was the translation quality of the video?</b></p>
                    <div class="star-rating" style="display: flex;">
                        <!-- Star 1 -->
                        <svg class="star" data-value="1" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer; margin-right: 5px;">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FFD700" stroke-width="2" fill="#FFD700" />
                        </svg>
                        <!-- Star 2 -->
                        <svg class="star" data-value="2" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer; margin-right: 5px;">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FFD700" stroke-width="2" fill="#FFD700" />
                        </svg>
                        <!-- Star 3 -->
                        <svg class="star" data-value="3" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer; margin-right: 5px;">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FFD700" stroke-width="2" fill="#FFD700" />
                        </svg>
                        <!-- Star 4 -->
                        <svg class="star" data-value="4" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer; margin-right: 5px;">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FFD700" stroke-width="2" fill="#FFD700" />
                        </svg>
                        <!-- Star 5 -->
                        <svg class="star" data-value="5" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FFD700" stroke-width="2" fill="#FFD700" />
                        </svg>
                    </div>
                    <p id="rating-feedback"></p>
                </div>
    
                <button id='restart-quiz' class="quiz-btn">Restart Quiz</button>
            </div>
        `;
    
        document.querySelector("#langage_text").innerHTML = resultsHTML;
    
        // Restart button event listener
        document.querySelector("#restart-quiz").addEventListener("click", () => {
            startDynamicQuiz(keywords);
        });
    
        // Star rating functionality
        document.querySelectorAll(".star").forEach(star => {
            star.addEventListener("click", function () {
                let selectedRating = this.getAttribute("data-value");
                document.getElementById("rating-feedback").innerText = `We got your rating, ${selectedRating} ⭐!`;
    
                // (Optional) Send rating data to a server or handle it as needed
                console.log("User rated:", selectedRating);
            });
        });
    }


    displayQuestion();
}

function getTransparencyWarning() {
    return `
        <div class="transparency-warning">
            <div class="warning-tooltip">
                Translations are AI-generated using OpenAI's LLM.<br>They may not always be 100% accurate.
            </div>
            <svg class="warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="gray" stroke-width="2" fill="transparent"/>
                <path d="M12 8V12" stroke="gray" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="gray"/>
            </svg>
        </div>
    `;
}

function displayInstructions() {
    const instructions = "Welcome to Langage! These are the steps to use this extension:\n1. Select 5 words to review.\n2. As the video plays, chunks of the video's text related to your selected words will be displayed in the sidebar.\n3. At the end of the video, a quiz going over your selected vocabulary will be available to take.";
    alert(instructions);
}


// Initial setup with start button
function initQuiz() {
    const startHTML = `
        <div class="quiz-container">
            <button id="start-quiz" class="quiz-btn large-start-btn">Start Vocab Quiz</button>
        </div>
    `;
    document.querySelector("#langage_text").innerHTML = startHTML;
    
    document.querySelector("#start-quiz").addEventListener("click", () => {
        startDynamicQuiz();
    });
};

/* BELOW ARE THE UTILITY FUNCTIONS,
ONLY SOME ARE USED IN THE CURRENT IMPLEMENTATION */

function sanitizeWidget() {
    // Sanitize Transcript Div
    document.querySelector("#langage_lang_select").innerHTML = "";
    document.querySelector("#langage_text").innerHTML = "";

    // Height Adjust
    document.querySelector("#langage_body").style.maxHeight = window.innerHeight - 160 + "px";
    document.querySelector("#langage_text").innerHTML = `
    <svg class="langage_loading" style="display: block;width: 48px;margin: 40px auto;" width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 36C59.9995 36 37 66 37 99C37 132 61.9995 163.5 100 163.5C138 163.5 164 132 164 99" stroke="#5C94FF" stroke-width="6"/>
    </svg>`;

    // Toggle Class List
    document.querySelector("#langage_body").classList.toggle("langage_body_show");
    document.querySelector("#langage_header_copy").classList.toggle("langage_header_icon_show");
    document.querySelector("#langage_header_summary").classList.toggle("langage_header_icon_show");
    // document.querySelector("#langage_header_track").classList.toggle("langage_header_icon_show");
    document.querySelector("#langage_header_profile").classList.toggle("langage_header_icon_show");
    document.querySelector("#langage_header_instructions").classList.toggle("langage_header_instructions_show");
}


function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}


function noTranscriptionAlert() {
    document.querySelector("#langage_text").innerHTML = `
        <div style="margin: 40px auto;text-align: center;">
            <p>No Transcription Available... 😢</p>
        </div>
    `;
}


function getTYCurrentTime() {
    return document.querySelector("#movie_player > div.html5-video-container > video").currentTime ?? 0;
}

function getTYEndTime() {
    return document.querySelector("#movie_player > div.html5-video-container > video").duration ?? 0;
}

function scrollIntoCurrTimeDiv() {
    const currTime = getTYCurrentTime();
    resynchChunks(currTime, currentChunkIndex);
}

function evtListenerOnTimestamp() {
    Array.from(document.getElementsByClassName("langage_transcript_text_timestamp")).forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const starttime = el.getAttribute("data-start-time");
            const ytVideoEl = document.querySelector("#movie_player > div.html5-video-container > video");
            ytVideoEl.currentTime = starttime;
            ytVideoEl.play();
        })
    })
}

function copyTranscript(videoId) {
    let contentBody = "";
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    contentBody += `${document.title}\n`;
    contentBody += `${url}\n\n`;
    // contentBody += `![](${url})\n`;
    contentBody += `Transcript:\n`;
    Array.from(document.getElementById("langage_text").children).forEach(el => {
        if (!el) { return; }
        if (el.children.length < 2) { return; }
        const timestamp = el.querySelector(".langage_transcript_text_timestamp").innerText;
        const timestampHref = el.querySelector(".langage_transcript_text_timestamp").getAttribute("data-timestamp-href");
        const text = el.querySelector(".langage_transcript_text").innerText;
        // contentBody += `- [${timestamp}](${`https://www.youtube.com${timestampHref}`}) ${text}\n`;
        contentBody += `(${timestamp}) ${text}\n`;
    })
    copyTextToClipboard(contentBody);
}

function simulateAd() {
    // Create a fake ad overlay element
    const fakeAd = document.createElement("div");
    fakeAd.classList.add("ad-showing"); // Mimics YouTube's ad class

    // Add it to the body
    document.body.appendChild(fakeAd);

    console.log("Ad started...");

    // Remove the ad after 3 seconds
    setTimeout(() => {
        fakeAd.remove();
        console.log("Ad ended.");
    }, 5000);
}
