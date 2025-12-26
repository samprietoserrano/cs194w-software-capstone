/**
 * searchParam.js
 * 
 * This file contains a utility function for parsing URL search parameters.
 * It extracts key-value pairs from a given search string or the current
 * window's location search string, decodes them, and returns them as an object.
 * This is useful for handling query parameters in web applications.
 */

export function getSearchParam(str) {
    // Use provided string or default to window.location.search if not provided
    const searchParam = (str && str !== "") ? str : window.location.search;
  
    // Return empty object if no valid search parameter is found
    if (!(/\?([a-zA-Z0-9_]+)/i.exec(searchParam))) return {};
  
    let match,
      // For replacing addition symbol with a space
      pl = /\+/g,
      // For matching key-value pairs in the query string
      search = /([^?&=]+)=?([^&]*)/g,
      // To decode URI components, replacing '+' with space
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      // Find the starting index of the query string (after '?')
      index = /\?([a-zA-Z0-9_]+)/i.exec(searchParam)["index"] + 1,
      // Extract the query string without the leading '?'
      query = searchParam.substring(index);
  
    let urlParams = {};
  
    // Iterate through all key-value pairs in the query string
    while (match = search.exec(query)) {
      // Decode and store each key-value pair in the urlParams object
      urlParams[decode(match[1])] = decode(match[2]);
    }
  
    // Return the object containing all parsed parameters
    return urlParams;
  }
  