document.addEventListener('DOMContentLoaded', function () {
    setupAdjustLetterSpacing();
    setupInputProcessing();
});

function setupAdjustLetterSpacing() {
    const subtitle = document.querySelector('.subtitle');
    const container = document.querySelector('.content');

    function adjustLetterSpacing() {
        subtitle.style.letterSpacing = 'normal';
        const subtitleWidth = subtitle.offsetWidth;
        const containerWidth = container.offsetWidth;
        const spacingNeeded = containerWidth - subtitleWidth;
        const numberOfCharacters = subtitle.textContent.length;
        const letterSpacing = spacingNeeded / (numberOfCharacters - 1);
        subtitle.style.letterSpacing = `${letterSpacing}px`;
    }

    requestAnimationFrame(adjustLetterSpacing);
    window.addEventListener('resize', adjustLetterSpacing);
}


function setupInputProcessing() {
    const input = document.getElementById('search-input');
    const resultsElements = setupResultsElements();
    const charDisplay = document.getElementById('char-display');

    const latinToNumberMap = getLatinToNumberMap();
    const arabicToNumberMap = getArabicToNumberMap();

    input.maxLength = 50;
    resultsElements.results.style.display = 'none';

    input.addEventListener('input', function () {
        const value = input.value.toLowerCase().trim();
        input.value = value;

        if (!value) {
            hideResults(resultsElements);
            updateCharTemplates(value, latinToNumberMap, arabicToNumberMap);
            return;
        }

        const isArabicInput = arabicToNumberMap.hasOwnProperty(value.charAt(0));
        const numbers = convertTextToNumbers(value, latinToNumberMap, arabicToNumberMap);

        updateResults(resultsElements, value, numbers, isArabicInput, latinToNumberMap, arabicToNumberMap);
        updateLanguageTemplate(value, arabicToNumberMap);
        updateCharTemplates(value, latinToNumberMap, arabicToNumberMap);
    });
}

function setupResultsElements() {
    return {
        gradResult: document.getElementById('grad-result'),
        massResult: document.getElementById('mass-result'),
        sumResult: document.getElementById('sum-result'),
        segnungResult: document.getElementById('segnung-result'),
        decimalFactorResult: document.getElementById('decimalFactor-result'),
        letterCountResult: document.getElementById('letterCount-result'),
        oberhalbResult: document.getElementById('oberhalb-result'),
        unterhalbResult: document.getElementById('unterhalb-result'),
        linksResult: document.getElementById('links-result'),
        rechtsResult: document.getElementById('rechts-result'),
        divisibilityResult: document.getElementById('divisibility-result'),
        additionResult: document.getElementById('addition-result'),
        subtractionResult: document.getElementById('subtraction-result'),
        multiplicationResult: document.getElementById('multiplication-result'),
        divisionResult: document.getElementById('division-result'),
        qResults: Array.from({ length: 9 }, (_, i) => document.getElementById(`q${i + 1}-result`)),
        results: document.getElementById('results'),
        charDisplay: document.getElementById('char-display'),
    };
}

function getLatinToNumberMap() {
    return {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6,
        'g': 7, 'h': 8, 'i': 9, 'j': 10, 'k': 11, 'l': 12,
        'm': 13, 'n': 14, 'o': 15, 'p': 16, 'q': 17, 'r': 18,
        's': 19, 't': 20, 'u': 21, 'v': 22, 'w': 23, 'x': 24,
        'y': 25, 'z': 26, ' ': 0,
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9
    };
}

function getArabicToNumberMap() {
    return {
        'ا': 1, 'ب': 2, 'ت': 3, 'ث': 4, 'ج': 5, 'ح': 6,
        'خ': 7, 'د': 8, 'ذ': 9, 'ر': 10, 'ز': 11, 'س': 12,
        'ش': 13, 'ص': 14, 'ض': 15, 'ط': 16, 'ظ': 17, 'ع': 18,
        'غ': 19, 'ف': 20, 'ق': 21, 'ك': 22, 'ل': 23, 'م': 24,
        'ن': 25, 'و': 26, 'ه': 27, 'ي': 28, ' ': 0,
        '٠': 0, '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5,
        '٦': 6, '٧': 7, '٨': 8, '٩': 9
    };
}

function hideResults(elements) {
    elements.results.style.display = 'none';
    elements.charDisplay.innerHTML = '';
    Object.values(elements).forEach(el => {
        if (el !== elements.results && el !== elements.charDisplay) {
            el.textContent = '';
        }
    });
}

function convertTextToNumbers(text, latinToNumberMap, arabicToNumberMap) {
    return Array.from(text).map(char => {
        if (char >= '0' && char <= '9') return Number(char);
        return latinToNumberMap[char] || arabicToNumberMap[char] || 0;
    });
}

function updateResults(elements, value, numbers, isArabicInput, latinToNumberMap, arabicToNumberMap) {
    elements.results.style.display = value ? (window.innerWidth <= 600 ? 'flex' : 'grid') : 'none';

    const addition = numbers.reduce((acc, num) => acc + num, 0);
    const subtraction = numbers.reduce((acc, num) => acc - num);
    const multiplication = numbers.reduce((acc, num) => acc * num, 1);
    const division = numbers.reduce((acc, num) => acc / num);
    
    const digitSumSteps = iterativeDigitSumSteps(addition);
    const additionText = getAdditionText(numbers, addition, digitSumSteps);

    elements.gradResult.textContent = removeZeros(digitSumSteps.finalSum);
    elements.massResult.textContent = addition;
    elements.sumResult.textContent = calculateSumResult(value, latinToNumberMap, arabicToNumberMap);
    elements.segnungResult.textContent = getSegnungResult(digitSum(addition), addition);
    elements.decimalFactorResult.textContent = calculateDecimalFactor(value, latinToNumberMap, arabicToNumberMap).toString();
    elements.letterCountResult.textContent = value.length;

    updatePercentageResults(value, elements, latinToNumberMap, arabicToNumberMap);

    elements.divisibilityResult.textContent = calculateDivisibilityPercentage(value, latinToNumberMap, arabicToNumberMap).toFixed(1) + '%';
    elements.additionResult.textContent = additionText;
    elements.subtractionResult.textContent = `${numbers.join(' - ')} = ${subtraction}`;
    elements.multiplicationResult.textContent = `${numbers.join(' * ')} = ${multiplication}`;
    elements.divisionResult.textContent = `${numbers.join(' / ')} = ${division}`;

    elements.charDisplay.innerHTML = `<div class="chars">${createCharNumberMapping(value, latinToNumberMap, arabicToNumberMap, isArabicInput)}</div>`;
}

function iterativeDigitSumSteps(n) {
    let steps = [];
    while (n > 9) {
        const digits = n.toString().split('');
        const sum = digits.reduce((acc, num) => acc + Number(num), 0);
        steps.push(`${digits.join(' + ')} = ${sum}`);
        n = sum;
    }
    return { finalSum: n, steps };
}

function getAdditionText(numbers, addition, digitSumSteps) {
    const initialDigitSum = digitSum(addition);
    const digitSumText = digitSumSteps.steps.join('; ');
    let additionText = `${numbers.join(' + ')} = ${addition}`;
    if (initialDigitSum > 10) {
        additionText += ` (Iter. QS: ${digitSumText})`;
    } else if (digitSumSteps.steps[0]) {
        additionText += ` (QS: ${digitSumSteps.steps[0]})`;
    }
    return additionText;
}

function removeZeros(n) {
    return n.toString().replace(/0/g, '');
}

function calculateSumResult(value, latinToNumberMap, arabicToNumberMap) {
    return value.split('').reduce((sum, char) => {
        const num = latinToNumberMap[char] || arabicToNumberMap[char] || 0;
        return sum + recursiveDigitSum(num);
    }, 0);
}


function getSegnungResult(finalSum, addition) {
    return finalSum === 10 ? '10' : addition === 100 ? '100' : '-';
}

function calculateDecimalFactor(value, latinToNumberMap, arabicToNumberMap) {
    let decimalFactor = 0;
    for (const char of value) {
        const num = latinToNumberMap[char] || arabicToNumberMap[char] || 0;
        if (num > 9 && num <= 18) {
            decimalFactor += 1;
        } else if (num > 18 && num <= 27) {
            decimalFactor += 2;
        } else if (num >= 27) {
            decimalFactor += 3;
        }
    }
    return decimalFactor;
}

function updatePercentageResults(value, elements, latinToNumberMap, arabicToNumberMap) {
    const charCount = value.length;
    const percentages = calculatePercentages(value, charCount, latinToNumberMap, arabicToNumberMap);

    elements.oberhalbResult.textContent = `${percentages.oberhalbPercentage.toFixed(0)}%`;
    elements.unterhalbResult.textContent = `${percentages.unterhalbPercentage.toFixed(0)}%`;
    elements.linksResult.textContent = `${percentages.linksPercentage.toFixed(0)}%`;
    elements.rechtsResult.textContent = `${percentages.rechtsPercentage.toFixed(0)}%`;

    percentages.qFields.forEach((percent, i) => {
        elements.qResults[i].textContent = percent.toFixed(1) + '%';
    });
}

function calculatePercentages(value, charCount, latinToNumberMap, arabicToNumberMap) {
    let oberhalbCount = 0;
    let linksCount = 0;
    const qFields = Array(9).fill(0);

    for (const char of value) {
        const num = latinToNumberMap[char] || arabicToNumberMap[char] || 0;
        const sumSteps = recursiveDigitSum(num);

        if ([1, 2, 8, 9].includes(sumSteps)) oberhalbCount++;

        if (sumSteps === 5) {
            linksCount += 0.5;
        } else if ([6, 7, 8, 9].includes(sumSteps)) {
            linksCount++;
        }

        if (sumSteps >= 1 && sumSteps <= 9) {
            qFields[sumSteps - 1]++;
        }
    }

    return {
        oberhalbPercentage: (oberhalbCount / charCount) * 100,
        unterhalbPercentage: 100 - (oberhalbCount / charCount) * 100,
        linksPercentage: (linksCount / charCount) * 100,
        rechtsPercentage: 100 - (linksCount / charCount) * 100,
        qFields: qFields.map(count => (count / charCount) * 100)
    };
}

function calculateDivisibilityPercentage(value, latinToNumberMap, arabicToNumberMap) {
    const charCount = value.length;
    let divisibilityCount = 0;

    for (const char of value) {
        const num = latinToNumberMap[char] || arabicToNumberMap[char] || 0;
        const digitSum = recursiveDigitSum(num);
        if (digitSum % 2 === 0) {
            divisibilityCount++;
        }
    }

    return (divisibilityCount / charCount) * 100;
}

function recursiveDigitSum(n) {
    const sum = n.toString().split('').reduce((acc, digit) => acc + Number(digit), 0);
    
    if (sum < 10) {
        return sum;
    }
    return recursiveDigitSum(sum);
}

function digitSum(n) {
    return n.toString().split('').reduce((acc, digit) => acc + Number(digit), 0);
}

function createCharNumberMapping(value, latinToNumberMap, arabicToNumberMap, isArabicInput) {
    let mapping = value.split('').map((char, index) => {
        const num = (char >= '0' && char <= '9') ? Number(char) : (latinToNumberMap[char] || arabicToNumberMap[char] || 0);
        const displayChar = char === ' ' ? '&nbsp;' : char;
        const digitSumResult = recursiveDigitSum(num);
        const isDigitSumEven = digitSumResult % 2 === 0 ? 1 : 0;

        return `<div class="char-item">
                <div class="char">${displayChar}</div>
                <div class="separator"></div>
                <div class="number">${num}</div>
                <div class="number">${digitSumResult}</div>
                <div class="number">${isDigitSumEven}</div>
            </div>`;
    });

    return isArabicInput ? mapping.reverse().join('') : mapping.join('');
}

function updateLanguageTemplate(value, arabicToNumberMap) {
    const arabicTemplate = document.getElementById('arabic-template');
    const latinTemplate = document.getElementById('latin-template');

    if (!value || arabicToNumberMap.hasOwnProperty(value.charAt(0))) {
        arabicTemplate.style.display = 'block';
        latinTemplate.style.display = 'none';
    } else {
        arabicTemplate.style.display = 'none';
        latinTemplate.style.display = 'block';
    }
}

function updateCharTemplates(value, latinToNumberMap, arabicToNumberMap) {
    if(value) {
        document.getElementById('base-logo').style.display = 'none';
    }
    if(!value) {
        document.getElementById('base-logo').style.display = '';
        document.getElementById('arabic-template').style.display = 'none';
        document.getElementById('latin-template').style.display = 'none';
    }
    const charTemplates = Array.from(document.querySelectorAll('.char-template'));
    charTemplates.forEach(template => template.style.display = 'none');
    document.querySelectorAll('.char-template-copy').forEach(copy => copy.remove());

    const charCount = {};

    value.split('').forEach(char => {
        const num = latinToNumberMap[char] || arabicToNumberMap[char] || 0;
        let digitSumResult = recursiveDigitSum(num);
        
        while (digitSumResult > 9) {
            digitSumResult = recursiveDigitSum(digitSumResult);
        }

        if (digitSumResult >= 1 && digitSumResult <= 9) {
            charCount[digitSumResult] = (charCount[digitSumResult] || 0) + 1;
        }
    });

    Object.entries(charCount).forEach(([key, count]) => {
        const template = document.getElementById(`template-${key}`);
        if (template) {
            template.style.display = 'block';

            for (let i = 1; i < count; i++) {
                const copy = template.cloneNode(true);
                copy.style.display = 'block';
                copy.classList.add('char-template-copy');
                copy.style.opacity = 1;
                copy.style.zIndex = parseInt(template.style.zIndex) + i;
                document.querySelector('.logo').appendChild(copy);
            }
        }
    });
}