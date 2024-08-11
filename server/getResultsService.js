

// getCitiesList = function {
//     let apiString = "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&q=&limit=32000";

// }
const citiesList = [];
const cacheCities = [];
const CachedCityVotes =[];
async function getCitiesList() {

    // var data = {
    //     resource_id: '929b50c6-f455-4be2-b438-ec6af01421f2', // the resource id
    //     limit: 5, // get 5 results
    //     q: 'jones' // query for 'jones'
    //   };
    //   $.ajax({
    //     url: 'https://data.gov.il/api/3/action/datastore_search',
    //     data: data,
    //     dataType: 'jsonp',
    //     success: function(data) {
    //       alert('Total results found: ' + data.result.total)
    //     }
    //   });
    const url = "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&q=&limit=32000";
    try {
        const response = await fetch(url);
        if (!response ||response.success == "false") {
            throw new Error(`Response status: ${response.success}`);
        }

        const json = await response.json();
        console.log(json);
        citiesList = json.result.records;
        return json;
    } catch (error) {
        console.error(error.message);
        return ("ERROR");
    }
}

async function getResultsByCity(cityId,cityName) {
    //"https://data.gov.il/api/3/action/datastore_search?resource_id=929b50c6-f455-4be2-b438-ec6af01421f2&q=%7B%22%D7%A9%D7%9D+%D7%99%D7%A9%D7%95%D7%91%22:%22%D7%92%D7%95%D7%A8%D7%9F%22%7D&limit=32000"
    //const url = "https://data.gov.il/api/3/action/datastore_search?resource_id=929b50c6-f455-4be2-b438-ec6af01421f2&q=בני ברק&limit=5";
    const qValue = { "שם ישוב": cityName };
    const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=929b50c6-f455-4be2-b438-ec6af01421f2&q=qValue&limit=5`;
    try {
        const response = await fetch(url);
        if (!response ||response.success == "false") {
            throw new Error(`Response status: ${response.success}`);
        }

        const json = await response.json();
        console.log(json);
        return json;
    } catch (error) {
        console.error(error.message);
        return ("ERROR");
    }
}

modules.export = {

}

export { getCitiesList, getResultsByCity };

