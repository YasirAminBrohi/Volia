/**
 * Parses Netscape format cookies.txt
 */
export function parseCookiesTxt(text) {
  const lines = text.split('\n').filter(line => 
    !line.startsWith('#') && line.trim() && line.includes('youtube.com')
  );
  
  return lines.map(line => {
    const parts = line.split('\t');
    return {
      name: parts[5],
      value: parts[6] ? parts[6].replace(/\r$/, '') : '',
      domain: parts[0],
      path: parts[2],
      secure: parts[3] === 'TRUE',
      expires: parseInt(parts[4]) || null
    };
  }).filter(c => c.name && c.value);
}

/**
 * Wraps parsed cookies into the format expected by Cobalt
 */
export function toCobaltCookiesJson(cookies) {
  return { youtube: cookies };
}
