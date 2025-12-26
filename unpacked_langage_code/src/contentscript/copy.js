/**
 * copyTextToClipboard - Copies the given text to the clipboard.
 *
 * This function first checks if the modern Clipboard API is available.
 * If it is, it uses the asynchronous `navigator.clipboard.writeText()` method.
 * If the Clipboard API is not available, it falls back to the older
 * `document.execCommand('copy')` method using a temporary textarea element.
 *
 *  @param {string} text - The text to be copied to the clipboard.
 */

// Function to copy text to clipboard
export function copyTextToClipboard(text) {
    // Check if the Clipboard API is available; use fallback method if not
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    } else {
      // Use Clipboard API to copy text
      navigator.clipboard.writeText(text).then(
        function () {
          // Success callback (empty in this case)
        },
        function (err) {
          // Error callback (empty in this case)
        }
      );
    }
  }
  
  // Fallback function for browsers that don't support Clipboard API
  function fallbackCopyTextToClipboard(text) {
    // Create a temporary textarea element
    var textArea = document.createElement("textarea");
    textArea.value = text;
  
    // Set textarea styles to make it invisible
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    // Add textarea to the document body
    document.body.appendChild(textArea);
  
    // Select the text in the textarea
    textArea.focus();
    textArea.select();
  
    try {
      // Attempt to copy using execCommand
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
    } catch (err) {
      // Error handling (empty in this case)
    }
  
    // Remove the temporary textarea from the document
    document.body.removeChild(textArea);
  }
  