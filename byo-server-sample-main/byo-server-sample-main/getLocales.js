// Map two-letter language locales to four-letter language locales
const localeMappings = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'ja': 'ja-JP',
    'de': 'de-DE',
    'ko': 'ko-KR',
    'zh': 'zh-CN',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'nl': 'nl-NL',
    'sv': 'sv-SE',
    'da': 'da-DK',
    'no': 'no-NO',
    'fi': 'fi-FI',
    'ru': 'ru-RU',
    'pl': 'pl-PL',
    'tr': 'tr-TR',
    'ar': 'ar-SA',
    'th': 'th-TH',
    'id': 'id-ID',
    'cs': 'cs-CZ',
    'hu': 'hu-HU',
    'ro': 'ro-RO',
    'he': 'he-IL',
    'vi': 'vi-VN',
    'uk': 'uk-UA',
    'hi': 'hi-IN'
};

function getUserLanguageLocales() {
    // Get the user's language preferences from the browser
    const userLanguages = window.navigator.languages || [window.navigator.language];

    // Map two-letter language locales to four-letter language locales
    const filteredUserLanguages = userLanguages.map(lang => localeMappings[lang] || lang);

    // Filter out "en-US" locale if already present in user's preferences
    const filteredAndDistinctUserLanguages = Array.from(new Set(filteredUserLanguages.filter(lang => lang !== 'en-US')));

    // Add "en-US" at the end of the array if it meets the criteria
    if (!filteredAndDistinctUserLanguages.includes('en-US') && filteredAndDistinctUserLanguages.length < 4) {
        filteredAndDistinctUserLanguages.push('en-US');
    }

    // Truncate the array to a maximum of 4 elements
    const truncatedUserLanguages = filteredAndDistinctUserLanguages.slice(0, 4);

    // Join the filtered and truncated user's language preferences into a string separated by colons
    const userLanguageLocales = truncatedUserLanguages.join(':');

    // Return the concatenated language locales string
    return userLanguageLocales;
}

let selectedLocales = getUserLanguageLocales()