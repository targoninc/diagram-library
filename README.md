# A JS+CSS diagram library for web development
This library was written in plain JavaScript and CSS as a hobby project. Feel free to modify the code and make it better.

# How to use
You can add the library to your project by inserting the following script tag:

```html
<script src="https://targoninc.com/diagrams/diagrams.js"/>
```

To use all features of the library, it is recommended to use something similar to the following code:

```html
<div class="settingbox diagram">
    <input type="checkbox" name="showPercentiles" id="showPercentiles" checked>
    <label for="showPercentiles">Show percentiles</label>
    <input type="checkbox" name="showAverages" id="showAverages" checked>
    <label for="showAverages">Show averages</label>
</div>
<details class="diagram" open>
    <summary class="diagram">Summary</summary>
    <div id="someStatistics" class="diagram_container">
    </div>
</details>
```

**You can create diagrams by calling the following method:**
```javascript
displayChart(element, type, labels[], values[], unitString, unitReverse, chartReverse, chartID)
```

This will work well with the provided CSS and enable you to make use of the analytic features, like percentiles and averages. You could disable the display on the settings box to hide it from the user. 
