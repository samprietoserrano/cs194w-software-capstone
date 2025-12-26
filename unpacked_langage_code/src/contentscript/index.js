/**
 * Window/Tab Script to embed the Vocab Panel on YouTube video pages.
 * 
 * This script is designed to add our LanGage panel to YouTube video pages.
 * It runs when the page loads and observes for URL changes to dynamically
 * insert or update the panel as users navigate between videos.
 * The script works specifically on the YouTube website and utilizes
 * MutationObserver to detect page changes without full reloads.
 */


"use strict";

import { insertVocabPanel } from "./youtube";

// Variable to store the previous URL
let oldHref = "";

// Pause the video immediately
const pauseVideo = () => {
    const video = document.querySelector("video");
    const isAdPlaying = document.querySelector("div.ad-showing, div.ytp-ad-module, div.ytp-ad-overlay-container, unskippable-ad-overlay");
    
    if (video) {
        if (!isAdPlaying) {
            video.pause();
            console.log("Video paused");
            domObserver.disconnect(); // Stop observing once the main video is paused
        } else {
            console.log("Ad detected, waiting for it to end...");
        }
    }
};

window.onload = async () => {
        
    if (window.location.hostname === "www.youtube.com") {

        const bodyList = document.querySelector("body");
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (oldHref !== document.location.href) {
                    oldHref = document.location.href;
                    insertVocabPanel();

                    // Pause the video when navigating to a new video
                    // setTimeout(pauseVideo, 500);
                }
            });
        });
        observer.observe(bodyList, { childList: true, subtree: true });
    }
}

