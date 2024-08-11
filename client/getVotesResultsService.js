
$(document).ready(async function () {
    await getResults();
    console.log('document is ready now ...');
});
let citiesList = [];
const cacheCities = [];
const cachedCityVotes = [];

async function getCitiesList() {
    if (citiesList.length)
        return citiesList;
    const url = "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&limit=32000";
    try {
        const response = await fetch(url);
        if (!response || response.success == "false") {
            throw new Error(`Response status: ${response.success}`);
        }

        const json = await response.json();
        console.log(json);
        citiesList = json.result.records;
        return citiesList;
    } catch (error) {
        console.error(error.message);
        return ("ERROR");
    }
}

function getDayTS() {
   // var ts = new Date().getTime();
    const ts = new Date().toISOString().slice(0, 10);
    return ts;
}

function getCachedCity(cityId) {

    const ts = getDayTS();
    if (cachedCityVotes[ts] && cachedCityVotes[ts][cityId])
        return cachedCityVotes[ts][cityId].result.records[0];
    return null;
}

function setCachedCity(cityId, cityResults) {
    const ts = getDayTS();
    if(!cachedCityVotes[ts]?.length)
       cachedCityVotes[ts] = [];
    cachedCityVotes[ts][cityId] = cityResults;
}

function removeCacheOnceADay() {
    var d = new Date().getTime();
    if (cachedCityVotes[d])
        Array.splice(cachedCityVotes[d]);
}

async function getResultsByCity(cityId, cityName) {
    let jsonResult;
    //"https://data.gov.il/api/3/action/datastore_search?resource_id=929b50c6-f455-4be2-b438-ec6af01421f2&q=%7B%22%D7%A9%D7%9D+%D7%99%D7%A9%D7%95%D7%91%22:%22%D7%92%D7%95%D7%A8%D7%9F%22%7D&limit=32000"
    //const url = "https://data.gov.il/api/3/action/datastore_search?resource_id=929b50c6-f455-4be2-b438-ec6af01421f2&q=בני ברק&limit=5";
    if (jsonResult = getCachedCity(cityId)) {
        console.log('from cache');
        return jsonResult;
    }

    const qValue = { "שם ישוב": cityName };
    const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=929b50c6-f455-4be2-b438-ec6af01421f2&q={"שם ישוב":"${cityName}"}&limit=5`;
    try {
        const response = await fetch(url);
        if (!response || response.success == "false") {
            throw new Error(`Response status: ${response.success}`);
        }

        jsonResult = await response.json();
        setCachedCity(cityId, jsonResult);
        console.log(jsonResult);

        return jsonResult.result.records[0];
    } catch (error) {
        console.error(error.message);
        return ("ERROR");
    }
}

// import { getCitiesList, getResultsByCity } from '../server/getResultsService.js';
async function getResults() {
    let result = await getCitiesList();
    if (!result || result == "ERROR") {
        $("#resultState").show();
        $("#resultState").html("Service Error");
        $("#resultsContainer").hide();
    }
    else {
        $("#resultsContainer").show();
        $("#resultState").hide();
        let select = $("#fetchCities");
        console.log(result);
        let optionsList = [];
        result.forEach(function (city) {
            var option = document.createElement("option");
            option.value = city._id;
            option.text = city.שם_ישוב;
            option.selected = select.value == city._id;
            $('#fetchCities').append(option);
        });

        $('#fetchCities').on('change', async (e) => {
            console.log('here hhh', e.target.value, e.target.text);
            try {
                console.log("Starting fetch");
                const response = await getResultsByCity(e.target.value, e.target.children[e.target.value - 1].text);
                const array = prepareResponseForChart(response);
                createChart(array);
                $("#resultState").hide();
                $("#votesResultsPerYear").show();
                console.log(`Response: ${response.status}`);
            } catch (e) {
                console.error(`Error: ${e}`);
                $("#resultState").html("Service Error");
                $("#resultState").show();
                $("#votesResultsPerYear").hide();
            }
        })

    }
}



function createChart(votesArray) {
    var chart = new ej.charts.Chart({
        title: 'תוצאות בחירות לישוב',
        primaryXAxis: {
            valueType: 'Category',
            majorGridLines: { width: 0 }
        },
        //Initializing Primary Y Axis
        primaryYAxis: {
            labelFormat: '{value}',
            title: 'מספר מצביעים למפלגה',
            //edgeLabelPlacement: 'Shift',
            majorTickLines: { width: 0 },
            lineStyle: { width: 0 },
        },
        chartArea: {
            border: {
                width: 0
            }
        },

        series: [
            {
                type: 'Bar',
                dataSource: votesArray,
                xName: 'party', width: 2, name: 'הצבעות למפלגה',
                yName: 'number', columnSpacing: 0.1
            },
        ],
    });
    chart.appendTo('#container');
}


function prepareResponseForChart(array) {
    let preparedArray = [];
    const size = 7;
    const minimalVotes = 10;
    let data = array;
    //recommended - get from api in const place (not hear )the valid list of parties for the required year . 
    var validPartiesNames = ['אמת', 'ג', 'ודעם', 'ז', 'זך', 'זץ', 'טב', 'י', 'יז', 'יך', 'יץ', 'כ', 'ל', 'מחל', 'מרצ', 'נז', 'ני', 'נץ', 'ע', 'פה', 'ף', 'ףץ', 'קנ', 'קץ', 'רק', 'שס'];
    $.each(data, function (key, valueObj) {
        if (validPartiesNames.indexOf(key) > -1 && valueObj >= minimalVotes) {
            preparedArray.push({ "party": key, "number": valueObj })
        }
    });
    preparedArray.sort((a, b) => b.number - a.number);

    preparedArray = preparedArray.slice(0, size);
    console.log(preparedArray)
    return preparedArray;
}