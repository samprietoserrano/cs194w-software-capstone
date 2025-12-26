# LanGage Learning

We are team 23 and we created the product LanGage, a Chrome browser extension with language-learning functionality to analyze Youtube videos to provide quick and short vocab review as scenes play out. 

## Trying Out the Code

To learn how our tool works, read the README at `unpacked_langage_code/README.md` (product video + user test plan).

**EDIT 1: In this reupload, option 1 of the two options presented below is not available (since the repo will be public). To test the tool/extension, follow option 2. For details, see the AUTHORS.md file.** 

**EDIT 2: Some links to the original repo and its Wiki are no longer valid, sadly. For details, see the AUTHORS.md file.**

To test our code, you can either (1) test the extension tool on its own within your Chrome browser, or (2) open and build our code yourself. 

(1) To install the extension as it is, follow these steps:

1. Download the folder `testable_extension` from our team GitHub.
2. In Google Chrome, open the Extensions page (chrome://extensions/).
3. Turn on Developer Mode by clicking the toggle switch in the top right corner of the page.
4. Click the `Load Unpacked` button and select the folder you downloaded from us.
5. LanGage should be installed and active! Head to Youtube to try it out and read the README at `unpacked_langage_code/README.md` in our Github for more on user instructions (product video + user test plan). 

(2) To build the extension package yourself, follow these steps:

1. Clone or download our team repo from Github. 
2. Navigate to the subdirectory `unpacked_langage_code/src/contentscript` and open the file `apiConfig.json`.
3. Enter your personal OpenAI API key here and save. 
4. Launch terminal within the `unpacked_langage_code` folder. 
5. Run `npm install` in terminal
```
npm install
```
6. Run `npm run build-release` to run Webpack and generate ***dist*** folder.
```
npm run build-release
```
7. This ***dist*** folder is the folder you load into the Chrome extension page (so its the same thing as the **testable_extension** we have provided on Github).
8. Follow the steps from above (1) to install the ***dist** folder on your browser. 

# Notes on API Keys

Previous commits to the original repo included an OpenAI API key(s) hardcoded in the `src` scripts. Those keys have been deativated. If you wish to Webpack our code yourself, you will need your own API key to plug into the `apiConfig.json` file. 

1. Orginal team repo was always private, so API key never was exposed publicly from the commits. 
2. We can freely share the packed folder that we build with Webpack (the folder to install the extension on your browser) because the `npm run build-release` command bundles the source code and minimizes the JS files. Thus the Webpack-ed files have the API key embedded but obfuscated/not readable.

Therefore, we could share the packed folder `testable_extension` with users right now without exposing the API key used. 

# Course Info
- Team milestones (team assignments): https://github.com/StanfordCS194/win25-Team23/milestones
- Course Syllabus (accurate assignment deadlines and schedule): https://docs.google.com/spreadsheets/d/1Y5Lcy-f3GsL_aUVHTDTYkmbaJQqK7sEhrNU9xM57UpQ/edit?usp=sharing

## Team Wiki Page
https://github.com/StanfordCS194/win25-Team23/wiki/Home

Milestone Task: Sam, Jiaju, Jordy, Emilio
