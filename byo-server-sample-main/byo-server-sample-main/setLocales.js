function generateOptions() {
    var selectElement = document.getElementById('languageDropdown');

    for (var language in localeMappings) {
        if (localeMappings.hasOwnProperty(language)) {
            var optionElement = document.createElement('option');
            optionElement.value = localeMappings[language];
            optionElement.textContent = language.toUpperCase() + ' - ' + localeMappings[language];
            selectElement.appendChild(optionElement);
        }
    }
}

// Call the function to generate and inject <option> elements into the <select> element by ID
generateOptions();

// Get the select element
var selectElement = document.getElementById('languageDropdown');

// Set the automatically detected locales as "selected" in the box, so that the user knows some languages have already been detected
function setLocaleOptions() {
    var selectElement = document.getElementById('languageDropdown');
    var options = selectElement.getElementsByTagName('option');

    var userLanguages = window.navigator.languages || [window.navigator.language];

    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        var optionValue = option.value;
        var isSelected = false; // Assume the option is not selected by default

        for (var j = 0; j < userLanguages.length; j++) {
            var userLanguage = userLanguages[j];
            var userLanguageCode = localeMappings[userLanguage] || userLanguage;

            if (optionValue === userLanguageCode) {
                isSelected = true; // Set the option as selected if there is a match
                break; // Exit the loop once a match is found
            }
        }

        option.selected = isSelected; // Set the option's selected property based on the match result
    }
}

setLocaleOptions()

// Add onchange event listener
selectElement.addEventListener('change', function () {
    // Get the selected options
    var selectedOptions = Array.from(selectElement.selectedOptions);

    // Extract the values of the selected options, limited to a maximum of 4 values
    var selectedValues = selectedOptions.slice(0, 4).map(function (option) {
        return option.value;
    });

    // Join the selected values into a colon-separated string
    var selectedValuesString = selectedValues.join(':');

    // Update the selectedLanguages variable with the user's selection
    selectedLanguages = selectedValuesString;

    // Update the speechToTextLocales property in the window.uneeqInteractionsOptions object
    window.uneeqInteractionsOptions.speechToTextLocales = selectedLanguages;
});