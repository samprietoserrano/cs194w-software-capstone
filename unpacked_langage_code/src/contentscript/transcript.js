import $ from "jquery";

export async function getLangOptionsWithLink(videoId) {
  
  // Get a transcript URL
  const videoPageResponse = await fetch("https://www.youtube.com/watch?v=" + videoId);
  const videoPageHtml = await videoPageResponse.text();
  const splittedHtml = videoPageHtml.split('"captions":')

  if (splittedHtml.length < 2) { return; } // No Caption Available

  const captions_json = JSON.parse(splittedHtml[1].split(',"videoDetails')[0].replace('\n', ''));
  const captionTracks = captions_json.playerCaptionsTracklistRenderer.captionTracks;
  const languageOptions = Array.from(captionTracks).map(i => { return i.name.simpleText; })

  return Array.from(languageOptions).map((langName, index) => {
    const track = captionTracks.find(i => i.name.simpleText === langName);
    const link = track.baseUrl;
    return {
      language: langName,
      languageCode: track.languageCode,
      link: link
    }
});

}


export async function getRawTranscript(link) {

  // Get Transcript
  const transcriptPageResponse = await fetch(link); // default 0
  const transcriptPageXml = await transcriptPageResponse.text();

  // Parse Transcript
  const jQueryParse = $.parseHTML(transcriptPageXml);
  const textNodes = jQueryParse[1].childNodes;

  return Array.from(textNodes).map(i => {
    return {
      start: i.getAttribute("start"),
      duration: i.getAttribute("dur"),
      text: i.textContent
    };
  });

}

// Newest version of function; outputs chunks for only selected words.
export async function getTranscriptHTML(rawTranscript, videoId, keywords, translatedWords) {
    
  let scriptObjArr = []

  // Filter the raw transcript to only contain chunks with exactly one useful term
  Array.from(rawTranscript).forEach((obj, i, arr) => {
    let tempObj = {
      start: obj.start,
      duration: obj.duration,//add
      text: obj.text
    };

    // Check if exactly one useful term is present in this chunk
    const matchedKeywords = keywords.filter(keyword => tempObj.text.includes(keyword));
    if (matchedKeywords.length === 1) { // Ensure exactly one match
    // if (matchedKeywords.length > 0) { // Allow all match
        scriptObjArr.push(tempObj);
    }

  });

  // Filter the objects array to only contain max 4 instances of each keyword
  const filteredScriptObjArr = [];
  keywords.forEach(keyword => {
      const occurrences = scriptObjArr.filter(obj => obj.text.includes(keyword));

      if (occurrences.length > 5) {
          // Randomly select up to 4 occurrences per keyword
          const selectedOccurrences = getRandomSubset(occurrences, 5);
          filteredScriptObjArr.push(...selectedOccurrences);
      } else {
          filteredScriptObjArr.push(...occurrences);
      }
  });
  
  scriptObjArr = filteredScriptObjArr;
  scriptObjArr.sort((a, b) => a.start - b.start); // Re-sort by start time

  return Array.from(scriptObjArr).map(obj => {
    const t = Math.round(obj.start);
    const hhmmss = convertIntToHms(t);

    // Subtitle data
    const matchedKeywords = keywords.filter(keyword => obj.text.includes(keyword));
    const keyword = matchedKeywords[0];
    const translation = getTranslation([keyword], translatedWords, keywords)[0];
    const end = parseFloat(obj.start) + parseFloat(obj.duration);

    // Processed text with highlights
    const { modifiedText, foundWords } = highlightText(obj.text, keywords);

    // Get translated words
    const translatedFoundWords = getTranslation(foundWords, translatedWords, keywords);

    let chunk_div = `
          <div><p style="font-style: italic; text-align: left; color: gray; font-size: 16px; padding-bottom: 5px;">Displaying vocab in this segment...<br></p></div>
          <div class="langage_transcript_text_segment">
              <div><a class="langage_transcript_text_timestamp" style="padding-top: 16px !important;" href="/watch?v=${videoId}&t=${t}s" target="_blank" data-timestamp-href="/watch?v=${videoId}&t=${t}s" data-start-time="${t}">${hhmmss}</a></div>
              <div class="langage_transcript_segment_split"> 
                <div class="langage_transcript_text" data-start-time="${t}">${modifiedText}</div>
                <div class="found_keywords">${translatedFoundWords.join(", ")}</div>
              </div>
          </div>
    `;
    return {
      chunk_html: chunk_div,
      start: obj.start,
      end: end,
      keyword: keyword,
      translation: translation
    };
  });
}

// Function to create random subset that includes the first item
function getRandomSubset(array, maxItems) {
  if (array.length === 0) return [];

  // Always include the first item
  const firstItem = array[0];

  // Shuffle the rest of the array
  const shuffledRest = array.slice(1)
    .map(item => ({ item, sortOrder: Math.random() })) // Assign a random sort order
    .sort((a, b) => a.sortOrder - b.sortOrder) // Shuffle
    .map(obj => obj.item); // Extract original items

  // Take up to maxItems - 1 from shuffled items
  return [firstItem, ...shuffledRest.slice(0, maxItems - 1)];
}

// Function to wrap vocab words with a span for styling
function highlightText(text, words) {
  let foundWords = [];
  let regex = new RegExp(`(${words.join("|")})`, "gi");

  let modifiedText = text.replace(regex, match => {
      foundWords.push(match); // Collect matched words
      return `<span class="highlighted-chunk-text">${match}</span>`;
  });

  return { modifiedText, foundWords };
}


// Function to get translation for each vocab word found in chunks
function getTranslation(foundWords, translations, keywords) {
  return foundWords.map(word => {
    let index = keywords.indexOf(word); // Find the word in the Mandarin array
    return index !== -1 ? translations[index] : word; // Return the English translation if found, otherwise keep original
  });
}

export function convertIntToHms(num) {
  const h = (num < 3600) ? 14 : 12;
  return (new Date(num * 1000).toISOString().substring(h, 19)).toString();
}