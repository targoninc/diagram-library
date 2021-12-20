// loads the css from Targon Industries website
let link = document.createElement("link");
link.href = "https://targoninc.com/diagrams/diagrams.css";
link.type = "text/css";
link.rel = "stylesheet";
link.media = "screen,print";
document.getElementsByTagName( "head" )[0].appendChild( link );

/**
 * Toggles one data point to be selected or not, depending on the previous state.
 * @returns {void}
 */
function toggleDiagramSelect() {
    if (this.hasAttribute("selected")) {
        this.removeAttribute("selected");
    } else {
        this.setAttribute("selected", "true");
    }
}

/**
 * Prepares the functionality for diagram points to be selected.
 * @returns {void}
 * @param {string} className The name of the class to apply the selection preparation to.
 */
function initDiagramSelect(className) {
    let elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', toggleDiagramSelect, false);
    }
}

/**
 * Initializes the selection feature and connects points in point charts.
 * @returns {void}
 */
function initDiagramSelects() {
    initDiagramSelect('diagram_bar');
    initDiagramSelect('diagram_vertical_space');
    connectPoints();
}

// create an Observer instance
const resizeObserver = new ResizeObserver(entries => 
    connectPoints()
)
// start observing a DOM node
resizeObserver.observe(document.body)
document.querySelectorAll('details').forEach((element) => {
    resizeObserver.observe(element)
});

window.onresize = function() {
    connectPoints(); // otherwise the svg data would still display on old scaling, which is bad
}

detailElements = document.querySelectorAll('details');
for (let i = 0; i < detailElements.length; i++) {
    detailElements[i].addEventListener('hover', function() {
        connectPoints();
    }, false)
    detailElements[i].addEventListener('mouseleave', function() {
        connectPoints();
    }, false)
}

percentileToggle = document.getElementById('showPercentiles');
percentileToggle.onchange = function() {
    connectPoints();
}
averageToggle = document.getElementById('showAverages');
averageToggle.onchange = function() {
    connectPoints();
}

/**
 * Connects all points in point charts, if existent.
 * @returns {void}
 */
function connectPoints() {
    drawHorizontals();
    let elements;
    try {
        elements = document.getElementsByClassName('diagram_vertical_space');
    } catch {
        // no diagram points have been found.
    }
    if (elements.length > 1) { // does not try to draw if there are less than two points
        for (let i = elements.length - 1; i > 0; i--) {
            //try {
                if (elements[i].childElementCount > 1) {
                    adjustLine(
                        elements[i].firstElementChild,
                        elements[i-1].firstElementChild,
                        elements[i].lastElementChild
                    );
                }
            //} catch {}
        }
    }
}

/**
 * Can be used to change the line thickness on demand.
 * @returns {void}
 * @param {number} change The amount to change by, in px.
 */
function changeLineThickness(change) {
    let diagramContainers = document.querySelectorAll('.diagram_container');
    for (let i = 0; i < diagramContainers.length; i++) {
        changeElementLineThickness(diagramContainers[i], change);
    }
}

/**
 * Can be used to change the line thickness for a single element.
 * @returns {void}
 * @param {HTMLElement} element The element to affect.
 * @param {number} change The amount to change by, in px.
 */
function changeElementLineThickness(element, change) {
    let newValue = parseInt(getComputedStyle(element).getPropertyValue('--diagram-lineThickness'))+parseInt(change);
    if (newValue < 1) {newValue = 1;}
    element.style = "--diagram-lineThickness: "+newValue+"px;";
}

/**
 * Attempts to draw percentile lines and average lines, if checkboxes are existent AND checked.
 * @returns {void}
 */
function drawHorizontals() {
    let i;
    let charts = document.getElementsByClassName('diagram_bars');
    let percentileToggle = document.getElementById('showPercentiles');
    let averageToggle = document.getElementById('showAverages');
    for (i = 0; i < charts.length; i++) {
        try {
            lineAvg = charts[i].nextElementSibling;
            line25 = lineAvg.nextElementSibling;
            line75 = line25.nextElementSibling;
        } catch {}
        if (averageToggle.checked) {
            try {lineAvg.classList.remove('hidden');} catch {}
            try {drawHorizontal(charts[i], lineAvg.getAttribute('value'), lineAvg);} catch {}
        } else {
            try {lineAvg.classList.add('hidden');} catch {}
        }
        if (percentileToggle.checked) {
            try {line25.classList.remove('hidden');} catch {}
            try {line75.classList.remove('hidden');} catch {}
            try {drawHorizontal(charts[i], line25.getAttribute('value'), line25);} catch {}
            try {drawHorizontal(charts[i], line75.getAttribute('value'), line75);} catch {}
        } else {
            try {line25.classList.add('hidden');} catch {}
            try {line75.classList.add('hidden');} catch {}
        }
    }
    charts = document.getElementsByClassName('diagram_points');
    for (i = 0; i < charts.length; i++) {
        try {
            lineAvg = charts[i].nextElementSibling;
            line25 = lineAvg.nextElementSibling;
            line75 = line25.nextElementSibling;
        } catch {}
        if (averageToggle.checked) {
            try {lineAvg.classList.remove('hidden');} catch {}
            try {drawHorizontal(charts[i], lineAvg.getAttribute('value'), lineAvg);} catch {}
        } else {
            try {lineAvg.classList.add('hidden');} catch {}
        }
        if (percentileToggle.checked) {
            try {line25.classList.remove('hidden');} catch {}
            try {line75.classList.remove('hidden');} catch {}
            try {drawHorizontal(charts[i], line25.getAttribute('value'), line25);} catch {}
            try {drawHorizontal(charts[i], line75.getAttribute('value'), line75);} catch {}
        } else {
            try {line25.classList.add('hidden');} catch {}
            try {line75.classList.add('hidden');} catch {}
        }
    }
}

/**
 * Transforms a div to draw a horizontal line.
 * @returns {void}
 * @param {HTMLElement} e The reference element.
 * @param {number} value The bottom margin, from 0 (none) to 1 (full).
 * @param {HTMLElement} line The element that will become the line.
 */
function drawHorizontal(e, value, line){
    var fT = e.offsetTop  + e.offsetHeight - (e.offsetHeight * value);
    var tT = e.offsetTop  + e.offsetHeight - (e.offsetHeight * value);
    var fL = e.offsetLeft;
    var tL = e.offsetLeft + e.offsetWidth;

    var CA   = Math.abs(tT - fT);
    var CO   = Math.abs(tL - fL);
    var H    = Math.sqrt(CA*CA + CO*CO);
    var ANG  = 180 / Math.PI * Math.acos( CA/H );
  
    if(tT > fT){
        var top  = (tT-fT)/2 + fT;
    }else{
        var top  = (fT-tT)/2 + tT;
    }
    if(tL > fL){
        var left = (tL-fL)/2 + fL;
    }else{
        var left = (fL-tL)/2 + tL;
    }
  
    if(( fT < tT && fL < tL) || ( tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)){
      ANG *= -1;
    }
    top-= H/2;

    line.style.transform = 'rotate('+ ANG +'deg)';
    line.style.top    = top+'px';
    line.style.left   = left+'px';
    line.style.height = H + 'px';
}

/**
 * Transforms a DOM element to span from one element to another.
 * @returns {void}
 * @param {HTMLElement} from The origin element.
 * @param {HTMLElement} to The target element.
 * @param {HTMLElement} line The element that will become the line.
 */
function adjustLine(from, to, line){
    var fT = from.offsetTop  + from.offsetHeight/2;
    var tT = to.offsetTop    + to.offsetHeight/2;
    var fL = from.offsetLeft + from.offsetWidth/2;
    var tL = to.offsetLeft   + to.offsetWidth/2;

    var CA   = Math.abs(tT - fT);
    var CO   = Math.abs(tL - fL);
    var H    = Math.sqrt(CA*CA + CO*CO);
    var ANG  = 180 / Math.PI * Math.acos( CA/H );
  
    if (tT > fT) {
        var top  = (tT-fT)/2 + fT;
    } else {
        var top  = (fT-tT)/2 + tT;
    }
    if (tL > fL) {
        var left = (tL-fL)/2 + fL;
    } else {
        var left = (fL-tL)/2 + tL;
    }
  
    if(( fT < tT && fL < tL) || ( tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)){
      ANG *= -1;
    }
    top -= H / 2;

    line.style.transform = 'rotate('+ ANG +'deg)';
    line.style.top    = top+'px';
    line.style.left   = left+'px';
    line.style.height = H + 'px';
}

/**
 * Sorts an array ascending.
 * @returns {Array}
 * @param {Array} arr
 */
const asc = arr => arr.sort((a, b) => a - b);

/**
 * Calculates the sum of a numerical array.
 * @param {Array<number>} arr
 */
const sum = arr => arr.reduce((a, b) => a + b, 0);

/**
 * Calculates the quantile for a numerical array and a given quantile (0-1).
 * @param {Array} arr
 * @param {number} q
 */
const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

/**
 * Converts an array to numerical.
 * @returns {Array<number>}
 * @param {Array} arr
 */
const toNumbers = arr => arr.map(Number);

/**
 * Displays a chart within a desired element.
 * @param {HTMLElement} element The element to place the chart within. Does not replace existing contents.
 * @param {string} type The type of the chart. Valid values: ["bar","point"]
 * @param {Array<string>} labels The labels to display, as array. E.g. ["month 1", "month 2", "month 3"]
 * @param {Array<number>} values The values to display, as array. E.g. [24, 37.2, 58]
 * @param {string} unitString The unit string, if applicable. E.g. "$" or "%"
 * @param {boolean} unitReverse If the unit string should be placed in front of the value, as boolean.
 * @param {boolean} reverse If the chart should be displayed in reverse, meaning the [0] elements will be placed on the right.
 * @param {string} chartID The ID to assign to the chart.
 */
function displayChart(element, type, labels, values, unitString, unitReverse, reverse, chartID) {
    if (reverse === true) {
        reversestring = 'diagram_flexReverse';
    } else {
        reversestring = '';
    }
    values = toNumbers(values);
    const values_max = Math.max(...values);
    values_copy = Array.from(values);
    const values_average = (sum(values_copy) / values.length) / values_max;
    const values_25 = quantile(values_copy, .25) / values_max;
    const values_75 = quantile(values_copy, .75) / values_max;
    let diagram_flexContainer = document.createElement("div");
    diagram_flexContainer.classList.add("diagram_flexContainer");
    let diagram_flexStretch = document.createElement("div");
    diagram_flexStretch.classList.add("diagram_flexStretch");
    let diagram_points = document.createElement("div");
    diagram_points.classList.add("diagram_points");
    if (reverse) {
        diagram_points.classList.add(reversestring);
    }
    diagram_points.id = chartID.toString();
    let counter = 0;
    values.forEach(value => {
        counter++;
        value = Math.round(value * 100) / 100;
        let valueString;
        if (unitReverse) {
            valueString = unitString + value;
        } else {
            valueString = value + unitString;
        }
        let valuePercentage = ((value / values_max) * 100);
        let dataValue = document.createElement("div");
        dataValue.classList.add("diagram_dataValue");
        dataValue.innerHTML = valueString;
        switch (type.toLowerCase()) {
            case "point":
                let diagram_space = document.createElement("div");
                diagram_space.classList.add("diagram_vertical_space");
                diagram_space.style.width = "calc(calc(100% / " + values.length.toString() + ") / " + BARSIZEFACTOR.toString() + ")";
                let diagram_point = document.createElement("div");
                diagram_point.classList.add("diagram_point");
                diagram_point.style.bottom = valuePercentage.toString() + "%";
                diagram_point.appendChild(dataValue);
                diagram_space.appendChild(diagram_point);
                if (counter > 1) {
                    let diagram_line = document.createElement("div");
                    diagram_line.classList.add("diagram_line");
                    diagram_space.appendChild(diagram_line);
                }
                diagram_points.appendChild(diagram_space);
                break;
            case "bar":
                let diagram_bar = document.createElement("div");
                diagram_bar.classList.add("diagram_bar");
                diagram_bar.style.width = "calc(calc(100% / " + values.length.toString() + ") / " + BARSIZEFACTOR.toString() + ")";
                diagram_bar.style.height = valuePercentage.toString() + "%";
                diagram_bar.appendChild(dataValue);
                diagram_points.appendChild(diagram_bar);
                break;
        }
    });
    let avgLine = document.createElement("div");
    avgLine.id = chartID + "AvgLine";
    avgLine.setAttribute("value", values_average.toString());
    avgLine.classList.add("diagram_horizontal");
    let percentile25 = document.createElement("div");
    percentile25.id = chartID + "25Line";
    percentile25.setAttribute("value", values_25.toString());
    percentile25.classList.add("diagram_horizontal");
    percentile25.classList.add("diagram_percentileLine");
    let percentile75 = document.createElement("div");
    percentile75.id = chartID + "75Line";
    percentile75.setAttribute("value", values_75.toString());
    percentile75.classList.add("diagram_horizontal");
    percentile75.classList.add("diagram_percentileLine");
    let xLabels = document.createElement("div");
    xLabels.classList.add("diagram_dataXlabels");
    if (reverse) xLabels.classList.add(reversestring);
    labels.forEach(label => {
        let labelContainer = document.createElement("div");
        labelContainer.style.width = "calc(calc(100% / " + values.length.toString() + ") / " + BARSIZEFACTOR.toString() + ")";
        let xLabel = document.createElement("div");
        xLabel.classList.add("diagram_dataXlabel");
        xLabel.innerHTML = label.toString();
        labelContainer.appendChild(xLabel);
        xLabels.appendChild(labelContainer);
    });
    diagram_flexStretch.appendChild(diagram_points);
    diagram_flexStretch.appendChild(avgLine);
    diagram_flexStretch.appendChild(percentile25);
    diagram_flexStretch.appendChild(percentile75);
    diagram_flexStretch.appendChild(xLabels);
    let yLabels = document.createElement("div");
    yLabels.classList.add("diagram_dataYlabels");
    let _25th = Math.round(values_25 * values_max * 100) / 100;
    let _75th = Math.round(values_75 * values_max * 100) / 100;
    let average = Math.round(values_average * values_max * 100) / 100;
    let top = Math.round(values_max * 100) / 100;
    let percentile25Label = document.createElement("div");
    if (unitReverse) {
        percentile25Label.innerHTML = unitString + _25th.toString() + "(25)";
    } else {
        percentile25Label.innerHTML = _25th.toString() + unitString + "(25)";
    }
    percentile25Label.style.bottom = "max(0px, min(250px, calc(" + (250 * values_25).toString() + "px - 14px)))";
    percentile25Label.style.color = "var(--neutral)";
    percentile25Label.classList.add("diagram_horizontalValue");
    let percentile75Label = document.createElement("div");
    if (unitReverse) {
        percentile75Label.innerHTML = unitString + _75th.toString() + "(75)";
    } else {
        percentile75Label.innerHTML = _75th.toString() + unitString + "(75)";
    }
    percentile75Label.style.bottom = "max(0px, min(250px, calc(" + (250 * values_75).toString() + "px - 14px)))";
    percentile75Label.style.color = "var(--neutral)";
    percentile75Label.classList.add("diagram_horizontalValue");
    let maxValueLabel = document.createElement("div");
    if (unitReverse) {
        maxValueLabel.innerHTML = unitString + top.toString();
    } else {
        maxValueLabel.innerHTML = top.toString() + unitString;
    }
    maxValueLabel.classList.add("diagram_maxYValue");
    let bottomValueLabel = document.createElement("div");
    if (unitReverse) {
        bottomValueLabel.innerHTML = unitString + "0";
    } else {
        bottomValueLabel.innerHTML = "0" + unitString;
    }
    bottomValueLabel.classList.add("diagram_bottomYValue");
    let averageLabel = document.createElement("div");
    averageLabel.style.bottom = "max(0px, min(250px, calc(" + (250 * values_average).toString() + "px - 14px)))";
    if (unitReverse) {
        averageLabel.innerHTML = unitString + average.toString();
    } else {
        averageLabel.innerHTML = average.toString() + unitString;
    }
    averageLabel.classList.add("diagram_horizontalYValue");
    yLabels.appendChild(percentile25Label);
    yLabels.appendChild(percentile75Label);
    yLabels.appendChild(maxValueLabel);
    yLabels.appendChild(bottomValueLabel);
    yLabels.appendChild(averageLabel);
    diagram_flexContainer.appendChild(diagram_flexStretch);
    diagram_flexContainer.appendChild(yLabels);
    element.appendChild(diagram_flexContainer);
    initDiagramSelects();
}