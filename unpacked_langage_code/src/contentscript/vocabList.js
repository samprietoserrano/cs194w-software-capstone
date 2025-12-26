// Description: This script compiled the list of vocabulary items for the detected language.

function getWiktionaryBaseUrl(langCode) {
    // Normalize the language code: if it contains a hyphen (or underscore), use the part before it.
    if (langCode.includes("-")) {
        langCode = langCode.split("-")[0];
    } else if (langCode.includes("_")) {
        langCode = langCode.split("_")[0];
    } else if (langCode.length > 2) {
        // Fallback: take the first two letters if longer than 2 characters.
        langCode = langCode.substring(0, 2);
    }
    
    const wiktionaryLanguages = {
        "ab": "ab.wiktionary.org", "aa": "aa.wiktionary.org", "af": "af.wiktionary.org",
        "ak": "ak.wiktionary.org", "sq": "sq.wiktionary.org", "am": "am.wiktionary.org",
        "ar": "ar.wiktionary.org", "an": "an.wiktionary.org", "hy": "hy.wiktionary.org",
        "as": "as.wiktionary.org", "av": "av.wiktionary.org", "ae": "ae.wiktionary.org",
        "ay": "ay.wiktionary.org", "az": "az.wiktionary.org", "bm": "bm.wiktionary.org",
        "ba": "ba.wiktionary.org", "eu": "eu.wiktionary.org", "be": "be.wiktionary.org",
        "bn": "bn.wiktionary.org", "bh": "bh.wiktionary.org", "bi": "bi.wiktionary.org",
        "bs": "bs.wiktionary.org", "br": "br.wiktionary.org", "bg": "bg.wiktionary.org",
        "my": "my.wiktionary.org", "ca": "ca.wiktionary.org", "ch": "ch.wiktionary.org",
        "ce": "ce.wiktionary.org", "ny": "ny.wiktionary.org", "zh": "zh.wiktionary.org",
        "cv": "cv.wiktionary.org", "kw": "kw.wiktionary.org", "co": "co.wiktionary.org",
        "cr": "cr.wiktionary.org", "hr": "hr.wiktionary.org", "cs": "cs.wiktionary.org",
        "da": "da.wiktionary.org", "dv": "dv.wiktionary.org", "nl": "nl.wiktionary.org",
        "dz": "dz.wiktionary.org", "en": "en.wiktionary.org", "eo": "eo.wiktionary.org",
        "et": "et.wiktionary.org", "ee": "ee.wiktionary.org", "fo": "fo.wiktionary.org",
        "fj": "fj.wiktionary.org", "fi": "fi.wiktionary.org", "fr": "fr.wiktionary.org",
        "ff": "ff.wiktionary.org", "gl": "gl.wiktionary.org", "ka": "ka.wiktionary.org",
        "de": "de.wiktionary.org", "el": "el.wiktionary.org", "gn": "gn.wiktionary.org",
        "gu": "gu.wiktionary.org", "ht": "ht.wiktionary.org", "ha": "ha.wiktionary.org",
        "he": "he.wiktionary.org", "hz": "hz.wiktionary.org", "hi": "hi.wiktionary.org",
        "ho": "ho.wiktionary.org", "hu": "hu.wiktionary.org", "ia": "ia.wiktionary.org",
        "id": "id.wiktionary.org", "ie": "ie.wiktionary.org", "ga": "ga.wiktionary.org",
        "ig": "ig.wiktionary.org", "ik": "ik.wiktionary.org", "io": "io.wiktionary.org",
        "is": "is.wiktionary.org", "it": "it.wiktionary.org", "iu": "iu.wiktionary.org",
        "ja": "ja.wiktionary.org", "jv": "jv.wiktionary.org", "kl": "kl.wiktionary.org",
        "kn": "kn.wiktionary.org", "kr": "kr.wiktionary.org", "ks": "ks.wiktionary.org",
        "kk": "kk.wiktionary.org", "km": "km.wiktionary.org", "ki": "ki.wiktionary.org",
        "rw": "rw.wiktionary.org", "ky": "ky.wiktionary.org", "kv": "kv.wiktionary.org",
        "kg": "kg.wiktionary.org", "ko": "ko.wiktionary.org", "ku": "ku.wiktionary.org",
        "kj": "kj.wiktionary.org", "la": "la.wiktionary.org", "lb": "lb.wiktionary.org",
        "lg": "lg.wiktionary.org", "li": "li.wiktionary.org", "ln": "ln.wiktionary.org",
        "lo": "lo.wiktionary.org", "lt": "lt.wiktionary.org", "lu": "lu.wiktionary.org",
        "lv": "lv.wiktionary.org", "gv": "gv.wiktionary.org", "mk": "mk.wiktionary.org",
        "mg": "mg.wiktionary.org", "ms": "ms.wiktionary.org", "ml": "ml.wiktionary.org",
        "mt": "mt.wiktionary.org", "mi": "mi.wiktionary.org", "mr": "mr.wiktionary.org",
        "mh": "mh.wiktionary.org", "mn": "mn.wiktionary.org", "na": "na.wiktionary.org",
        "nv": "nv.wiktionary.org", "nd": "nd.wiktionary.org", "ne": "ne.wiktionary.org",
        "ng": "ng.wiktionary.org", "nb": "nb.wiktionary.org", "nn": "nn.wiktionary.org",
        "no": "no.wiktionary.org", "ii": "ii.wiktionary.org", "nr": "nr.wiktionary.org",
        "oc": "oc.wiktionary.org", "oj": "oj.wiktionary.org", "cu": "cu.wiktionary.org",
        "om": "om.wiktionary.org", "or": "or.wiktionary.org", "os": "os.wiktionary.org",
        "pa": "pa.wiktionary.org", "pi": "pi.wiktionary.org", "fa": "fa.wiktionary.org",
        "pl": "pl.wiktionary.org", "ps": "ps.wiktionary.org", "pt": "pt.wiktionary.org",
        "qu": "qu.wiktionary.org", "rm": "rm.wiktionary.org", "rn": "rn.wiktionary.org",
        "ro": "ro.wiktionary.org", "ru": "ru.wiktionary.org", "sa": "sa.wiktionary.org",
        "sc": "sc.wiktionary.org", "sd": "sd.wiktionary.org", "se": "se.wiktionary.org",
        "sm": "sm.wiktionary.org", "sg": "sg.wiktionary.org", "sr": "sr.wiktionary.org",
        "gd": "gd.wiktionary.org", "sn": "sn.wiktionary.org", "si": "si.wiktionary.org",
        "sk": "sk.wiktionary.org", "sl": "sl.wiktionary.org", "so": "so.wiktionary.org",
        "st": "st.wiktionary.org", "es": "es.wiktionary.org", "su": "su.wiktionary.org",
        "sw": "sw.wiktionary.org", "ss": "ss.wiktionary.org", "sv": "sv.wiktionary.org",
        "ta": "ta.wiktionary.org", "te": "te.wiktionary.org", "tg": "tg.wiktionary.org",
        "th": "th.wiktionary.org", "ti": "ti.wiktionary.org", "bo": "bo.wiktionary.org",
        "tk": "tk.wiktionary.org", "tl": "tl.wiktionary.org", "tn": "tn.wiktionary.org",
        "to": "to.wiktionary.org", "tr": "tr.wiktionary.org", "ts": "ts.wiktionary.org",
        "tt": "tt.wiktionary.org", "tw": "tw.wiktionary.org", "ty": "ty.wiktionary.org",
        "ug": "ug.wiktionary.org", "uk": "uk.wiktionary.org", "ur": "ur.wiktionary.org",
        "uz": "uz.wiktionary.org", "ve": "ve.wiktionary.org", "vi": "vi.wiktionary.org",
        "vo": "vo.wiktionary.org", "wa": "wa.wiktionary.org", "cy": "cy.wiktionary.org",
        "wo": "wo.wiktionary.org", "fy": "fy.wiktionary.org", "xh": "xh.wiktionary.org",
        "yi": "yi.wiktionary.org", "yo": "yo.wiktionary.org", "za": "za.wiktionary.org",
        "zu": "zu.wiktionary.org", "ace": "ace.wiktionary.org", "ady": "ady.wiktionary.org",
        "alt": "alt.wiktionary.org", "arv": "arv.wiktionary.org", "ast": "ast.wiktionary.org",
        "ban": "ban.wiktionary.org", "bar": "bar.wiktionary.org", "bcl": "bcl.wiktionary.org",
        "bpy": "bpy.wiktionary.org", "bjn": "bjn.wiktionary.org", "bug": "bug.wiktionary.org",
        "ceb": "ceb.wiktionary.org", "ckb": "ckb.wiktionary.org", "crh": "crh.wiktionary.org",
        "csb": "csb.wiktionary.org", "din": "din.wiktionary.org", "diq": "diq.wiktionary.org",
        "dsb": "dsb.wiktionary.org", "eml": "eml.wiktionary.org", "ext": "ext.wiktionary.org",
        "frr": "frr.wiktionary.org", "fur": "fur.wiktionary.org", "gag": "gag.wiktionary.org",
        "gom": "gom.wiktionary.org", "hif": "hif.wiktionary.org", "hsb": "hsb.wiktionary.org",
        "ilo": "ilo.wiktionary.org", "inh": "inh.wiktionary.org", "kaa": "kaa.wiktionary.org",
        "kab": "kab.wiktionary.org", "kbd": "kbd.wiktionary.org", "koi": "koi.wiktionary.org",
        "krc": "krc.wiktionary.org", "ksh": "ksh.wiktionary.org", "lad": "lad.wiktionary.org",
        "lbe": "lbe.wiktionary.org", "lez": "lez.wiktionary.org", "lij": "lij.wiktionary.org",
        "liv": "liv.wiktionary.org", "lmo": "lmo.wiktionary.org", "mai": "mai.wiktionary.org",
        "mdf": "mdf.wiktionary.org", "mhr": "mhr.wiktionary.org", "min": "min.wiktionary.org",
        "mrj": "mrj.wiktionary.org", "mwl": "mwl.wiktionary.org", "myv": "myv.wiktionary.org",
        "mzn": "mzn.wiktionary.org", "nap": "nap.wiktionary.org", "nds": "nds.wiktionary.org",
        "nso": "nso.wiktionary.org", "pcd": "pcd.wiktionary.org", "pdc": "pdc.wiktionary.org",
        "pfl": "pfl.wiktionary.org", "pms": "pms.wiktionary.org", "pnb": "pnb.wiktionary.org",
        "rue": "rue.wiktionary.org", "sah": "sah.wiktionary.org", "scn": "scn.wiktionary.org",
        "sco": "sco.wiktionary.org", "szy": "szy.wiktionary.org", "tet": "tet.wiktionary.org",
        "tpi": "tpi.wiktionary.org", "tum": "tum.wiktionary.org", "udm": "udm.wiktionary.org",
        "vec": "vec.wiktionary.org", "vep": "vep.wiktionary.org", "vls": "vls.wiktionary.org",
        "war": "war.wiktionary.org", "wuu": "wuu.wiktionary.org", "xal": "xal.wiktionary.org",
        "xmf": "xmf.wiktionary.org"
    };
    return wiktionaryLanguages[langCode] || "en.wiktionary.org";
}

// Create a list item for a vocabulary item
function createVocabItem(originalTerm, englishTerm, detectedLanguage) {
    const listItem = document.createElement("li");
    listItem.className = "langage-vocab-item";

    const originalLink = document.createElement("a");
    originalLink.href = `https://${getWiktionaryBaseUrl(detectedLanguage)}/wiki/${encodeURIComponent(originalTerm)}`;
    originalLink.textContent = originalTerm;
    originalLink.target = "_blank";
    originalLink.className = "wiktionary-link";

    const englishLink = document.createElement("a");
    englishLink.href = `https://en.wiktionary.org/wiki/${encodeURIComponent(englishTerm)}`;
    englishLink.textContent = englishTerm;
    englishLink.target = "_blank";
    englishLink.className = "wiktionary-link";

    listItem.appendChild(originalLink);
    listItem.appendChild(document.createTextNode(" - "));
    listItem.appendChild(englishLink);

    return listItem;
}

// Create the vocabulary list
function createVocabList(originalTerms, englishTerms, selectedIndices, detectedLanguage) {
    const vocabListContainer = document.getElementById("langage_vocab_list");
    if (!vocabListContainer) return;

    vocabListContainer.innerHTML = "";

    if (originalTerms.length === 0) {
        vocabListContainer.innerHTML = "<p>No vocabulary available.</p>";
        return;
    }

    const list = document.createElement("ul");
    list.className = "langage-vocab-list";

    // Add selected terms first (if any)
    if (selectedIndices && selectedIndices.length > 0) {
        selectedIndices.forEach((idx) => {
            if (idx >= 0 && idx < originalTerms.length) {
                const listItem = createVocabItem(originalTerms[idx], englishTerms[idx], detectedLanguage);
                list.appendChild(listItem);
            }
        });
    }

    // Add remaining terms
    originalTerms.forEach((term, idx) => {
        if (!selectedIndices || !selectedIndices.includes(idx)) {
            const listItem = createVocabItem(term, englishTerms[idx], detectedLanguage);
            list.appendChild(listItem);
        }
    });

    vocabListContainer.appendChild(list);
    vocabListContainer.style.display = "block";
}

export function toggleVocabList(originalTerms, englishTerms, selectedIndices, detectedLanguage) {
    // If selectedIndices is not an array, assume the call was made with only three arguments.
    // In that case, compute selectedIndices from the global `keywords` array.
    if (!Array.isArray(selectedIndices)) {
        detectedLanguage = selectedIndices;
        selectedIndices = [];
        if (window.keywords && Array.isArray(window.keywords)) {
            window.keywords.forEach(word => {
                const idx = originalTerms.indexOf(word);
                if (idx !== -1) {
                    selectedIndices.push(idx);
                }
            });
        }
    }

    const vocabListContainer = document.getElementById("langage_vocab_list");
    if (!vocabListContainer) return;

    if (vocabListContainer.style.display === "block") {
        vocabListContainer.style.display = "none";
    } else {
        createVocabList(originalTerms, englishTerms, selectedIndices, detectedLanguage);
    }
}
