/*
Things to ask Dr. Lundberg
- Can you predict grammatical endings?
- Can you predict prefixes?
- Are there any rules we didn't talk about?
- Are there any exceptions?
- Assimilation of softness - what if you have different places of articulation in one cluster, some matching, some not?
- Can you predict the accent?
*/


var vowelArray = ['ё', 'я', 'е', 'ы', 'и', 'у', 'о', 'ю', 'э', 'а'];
var consArray = ['ш', 'р', 'т', 'п', 'щ', 'с', 'д', 'ф', 'г', 'ч', 'к', 'л', 'ж', 'з', 'х', 'ц', 'в', 'б', 'н', 'м', 'й'];
var signsArray = ['ъ', 'ь', 'й'];
var softening = ['ё', 'я', 'е', 'и', 'ю', 'ь'];
var placeArray = { ш: 'palatal', р: 'dental', т: 'dental', п: 'labial', щ: 'other', с: 'dental', д: 'dental', ф: 'labial', г: 'velar', ч: 'palatal', к: 'velar', л: 'dental', ж: 'palatal', з: 'dental', х: 'velar', ц: 'dental', в: 'labial', б: 'labial', н: 'dental', м: 'labial' };
var sonorants = ['л', 'р', 'м', 'н'];
var sonorantsAndB = ['л', 'р', 'м', 'н', 'в'];
var voicingPartners = { ш: 'ж', т: 'д', п: 'б', с: 'з', д: 'т', щ: 'щ', ф: 'в', г: 'к', ч: 'ч', к: 'г', ж: 'ш', з: 'с', х: 'х', ц: 'ц', в: 'ф', б: 'п', й: 'й' };
var voicedArray = ['д', 'г', 'ж', 'з', 'в', 'б']; //excludes sonorants
var vowelPartners = { ё: 'о', я: 'а', е: 'э', ю: 'у', и: 'и', о: 'о', э: 'э', а: 'а', ы: 'ы', у: 'у' };

function wordToArray(textWorking) {
    console.log("in wordToArray");
    var wordArray = [];
    var targetLetter;
    var accentFound = -1; //-1 until found, position from accent thereafter. - before, + after
    for (var i = 0; i < textWorking.length; i++) {
        targetLetter = textWorking.substring(i, i + 1);
        console.log("adding letters to array:", targetLetter, wordArray);
        //Add vowel to array
        if ($.inArray(targetLetter, vowelArray) > -1) {
            var accent = 0; //Value will be reassigned after array is filled
            var softener = false; //Will be assigned true if in softening array
            //If accent has been found, assign position from accent
            if (accentFound > -1) {
                accent = accentFound;
                accentFound++;
            }
            if ($.inArray(targetLetter, softening) > -1) {
                softener = true;
            }
            //If "softener" at beginning of word
            wordArray.push({ letter: targetLetter, transcriptionP1: "", transcription: vowelPartners[targetLetter], type: 'vowel', accent: accent, softener: softener });
            if (softener == true && i == 0) {
                wordArray[wordArray.length - 1]['transcriptionP1'] = 'й';
                console.log("softener at beginning of word");
            }
            //If "softener" is preceeded by another vowel, add й
            else if (softener == true && wordArray[wordArray.length - 2]['type'] == 'vowel') {
                wordArray[wordArray.length - 1]['transcriptionP1'] = 'й';
                console.log("softener preceeded by vowel");
            }
            if ((textWorking.substring(wordArray.length - 2, wordArray.length - 1) == 'ь' || textWorking.substring(wordArray.length - 2, wordArray.length - 1) == 'ъ') && wordArray[wordArray.length - 1]['softener'] == true) {
                wordArray[wordArray.length - 1]['transcriptionP1'] = 'й';
                console.log("softener preceeded by soft or hard sign")
            }
        }
        //Add consonant to array
        else if ($.inArray(targetLetter, consArray) > -1) {
            var place = placeArray[targetLetter];
            var voicing;
            var soft = false; //Will be assigned true if soft later
            var sonorantBool = false;
            var voiced = false;
            if ($.inArray(targetLetter, sonorants) > -1) {
                sonorantBool = true;
            }
            if ($.inArray(targetLetter, voicedArray) > -1) {
                voiced = true;
            }
            wordArray.push({ letter: targetLetter, transcriptionP1: "", transcription: targetLetter, type: 'consonant', place: place, soft: false, sonorant: sonorantBool, voiced: voiced });

        }
        //Add others: ъ,ь,й
        else if ($.inArray(targetLetter, signsArray) > -1) {
            if (targetLetter == 'ь') {
                wordArray.push({ letter: targetLetter, transcriptionP1: "", transcription: '', type: 'sign', softener: true });
            }
            else {
                wordArray.push({ letter: targetLetter, transcriptionP1: "", transcription: '', type: 'sign' })
            }

        }
        //Apostraphe - A.K.A. accent marker
        else if (targetLetter == '’' || targetLetter == '\'') {
            if ($.inArray(textWorking.substring(i - 1, i), vowelArray) == -1) {
                console.log("accent not placed on vowel");
                return null;
            }
            wordArray[i - 1]['accent'] = 0;
            accentFound = 0;
            for (var j = wordArray.length - 1; j >= 0; j--) {
                if (wordArray[j]['type'] == 'vowel') {
                    wordArray[j]['accent'] = accentFound;
                    accentFound--;
                }
            }
            wordArray[i - 1]['transcription'] = '<font color=\'red\'>' + wordArray[i - 1]['transcription'] + '</font>';
            accentFound = 1;
        }
        else if (targetLetter == ' ') {
            //do nothing
        }
        //Punctuation
        else {
            console.log("non-Russian letter entered: ", targetLetter);
            return null;
            //alert("Please do not enter puncuation or non-Russian letters");
        }
    }
    return wordArray;
}

//Yeri's rule - и becomes ы after ж,ш,ц
function yerisRule(wordArray) {
    console.log("in yerisRule")
    for (var i = 1; i < wordArray.length - 1; i++) {
        if (wordArray[i]['letter'] == 'и' && $.inArray(wordArray[i - 1]['letter'], ['ж', 'ш', 'ц']) > -1) {
            if (wordArray[i]['accent'] == 0) {
                wordArray[i]['transcription'] = 'Ы';
            }
            else {
                wordArray[i]['transcription'] = 'ы';
            }
        }
    }
    return wordArray;
}

//Adds voicing assimilation, returns wordArray
function voicingAssimilation(wordArray) {
    //Final devoicing: C:[-voice]# (where C = obstruent)
    if (wordArray[wordArray.length - 1]['type'] == 'consonant' && wordArray[wordArray.length - 1]['voiced'] == true && wordArray[wordArray.length - 1]['sonorant'] == false) {
        wordArray[wordArray.length - 1]['voiced'] = false;
        wordArray[wordArray.length - 1]['transcription'] = voicingPartners[wordArray[wordArray.length - 1]['letter']];
    }

    //Voicing assimilation: C:[+/-voice][+/-voice] (where C = obstruent)
    var voiceOrNo = 'vowel';
    for (var i = wordArray.length - 1; i >= 0; i--) {
        if (wordArray[i]['type'] == 'consonant') {
            if (voiceOrNo == 'vowel' && $.inArray(wordArray[i]['letter'], sonorantsAndB) == -1) {
                if (wordArray[i]['voiced'] == true) {
                    voiceOrNo = 'voice';
                }
                else {
                    voiceOrNo = 'voiceless';
                }
            }
            else if (voiceOrNo == 'voice' && $.inArray(wordArray[i]['letter'], sonorants) == -1) {
                if (wordArray[i]['voiced'] == false) {
                    wordArray[i]['voiced'] = true;
                    wordArray[i]['transcription'] = voicingPartners[wordArray[i]['letter']];
                }
            }
            else if (voiceOrNo == 'voiceless' && $.inArray(wordArray[i]['letter'], sonorants) == -1) {
                if (wordArray[i]['voiced'] == true) {
                    wordArray[i]['voiced'] = false;
                    wordArray[i]['transcription'] = voicingPartners[wordArray[i]['letter']];
                }
            }
        }
        else {
            voiceOrNo = 'vowel';
        }
    }
    return wordArray;
}

//Adds initial softness, returns wordArray
function addSoftness(wordArray) {

    for (var i = 0; i < wordArray.length - 1; i++) {
        if (wordArray[i]['type'] == 'consonant' && (wordArray[i + 1]['type'] == 'vowel' || wordArray[i + 1]['type'] == 'sign') && wordArray[i + 1]['softener'] == true) {
            if ($.inArray(wordArray[i]['letter'], ['ж', 'ш', 'ц','щ','й','ч']) == -1) {
                wordArray[i]['soft'] = true;
                wordArray[i]['transcription'] += '\'';
            }
        }
    }
    return wordArray;
}

//Adds softness assimilation, returns wordArray
function softenessAssimilation(wordArray) {

    for (var i = wordArray.length - 1; i >= 0; i--) {

        if (wordArray[i]['type'] == 'consonant' && wordArray[i]['soft'] == true) {
            if (i - 1 >= 0 && wordArray[i - 1]['type'] == 'consonant' && wordArray[i]['place'] == wordArray[i - 1]['place']) {
                wordArray[i - 1]['soft'] = true;
                wordArray[i - 1]['transcription'] += '\'';
            }
        }

    }

    return wordArray;
}

//Adds akanje, returns wordArray
function akanje(wordArray) {
    console.log('in akanje');

    for (var i = 0; i < wordArray.length; i++) {
        if (wordArray[i]['letter'] == 'а' || wordArray[i]['letter'] == 'о' || wordArray[i]['letter'] == 'А' || wordArray[i]['letter'] == 'О') {

            if (wordArray[i]['accent'] == 0) {
                //do nothing
            }
            else if (wordArray[i]['accent'] == -1 || i == 0) {
                wordArray[i]['transcription'] = 'ʌ';
            }
            else {
                wordArray[i]['transcription'] = 'ъ';

            }

        }
    }

    return wordArray;
}

//Adds ikanje and ykanje, returns wordArray
function ikanje(wordArray) {
    console.log("in ikanje");
    for (var i = 0; i < wordArray.length; i++) {
        if ($.inArray(wordArray[i]['letter'], ['я', 'е', 'Я', 'Е']) > -1) {

            if (wordArray[i]['accent'] == 0) {
                //do nothing
            }
            else if (wordArray[i]['accent'] == -1) {
                wordArray[i]['transcription'] = 'и';
            }
            else {
                wordArray[i]['transcription'] = 'ь';
            }
        }
    }

    return wordArray;
}

//Adds tense e, returns wordArray
function tenseE(wordArray) {

    for (var i = 0; i < wordArray.length; i++) {
        if (wordArray[i]['letter'] == 'е' && wordArray[i]['accent'] == 0 && i != wordArray.length - 1) {
            if (wordArray[i + 1]['type'] == 'consonant' && wordArray[i + 1]['soft'] == true) {
                wordArray[i]['transcription'] = '<font color=\'red\'><u>э</u></font>';
            }
            else if (wordArray[i + 1]['type'] == 'vowel' && wordArray[i + 1]['softener'] == true) {
                wordArray[i]['transcription'] = '<font color=\'red\'><u>э</u></font>';
            }
        }
    }

    return wordArray;
}

function processText() {
    event.preventDefault();
    console.log("up and running!");
    var textWorking = $('#textIn').val().toLowerCase().replace(/ /g,"");
    console.log("string input: ", textWorking);
    var initialLength = textWorking.length;
    for (var i = 0; i < initialLength; i++) {
        //console.log("in for loop with:", textWorking.substring(i,i+1));
        if (textWorking.substring(i,i+1) == "ё") {
            textWorking = textWorking.substring(0,i + 1) + '\'' + textWorking.substring(i + 1);
        }
    }
    console.log("text without yo:", textWorking);
    console.log("in processText");
    var wordArray = wordToArray(textWorking);
    wordArray = yerisRule(wordArray);
    wordArray = voicingAssimilation(wordArray);
    wordArray = addSoftness(wordArray);
    wordArray = softenessAssimilation(wordArray);
    wordArray = akanje(wordArray);
    wordArray = ikanje(wordArray);
    wordArray = tenseE(wordArray);
    var transcription = '[';
    for (var i = 0; i < wordArray.length; i++) {
        transcription += wordArray[i]['transcriptionP1'];
        transcription += wordArray[i]['transcription'];
    }
    transcription += ']';
    $('#textOut').html(transcription);
    console.log(wordArray);
}
