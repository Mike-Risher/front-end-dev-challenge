import {ChallengeDataService} from './ChallengeDataService.js'

const cdsvc = new ChallengeDataService();

document.getElementById("btnSm").addEventListener("click", function () {
    getDataAndRender("small");
})

document.getElementById("btnMd").addEventListener("click", function () {
    getDataAndRender("medium");
})

document.getElementById("btnLg").addEventListener("click", function () {
    getDataAndRender("large");
})

document.getElementById("stream").addEventListener("click", function() {
    startStreaming();
})

// document.getElementById("streamStop").addEventListener("click", async function () {
// })

// retrieves data and charts it
const getDataAndRender = async(size) => {
    console.log("retrieving "+size);
    
    const d = await cdsvc.getDataSet(size)
    const xArr = d._xColumn._values;
    const yArr = d._yColumn._values;
    let newData = [];
    for (let i=0; i < xArr.length; i++) { 
        const obj = { x: xArr[i], y: yArr[i] };
        newData.push(obj);
    }
    // console.log(newData);
    const chart = document.getElementById("chart");
    chart.data = newData;
    drawTable(newData);  
}

// creates the html table using data in the same format used by challengeChart  {x: 0, y: 1}
const drawTable = (data) => {
    const tbl = document.getElementById('table');
   
    while (tbl.firstChild) {  // erase previous table, if any, so we don't keep adding rows to the same table
        tbl.removeChild(tbl.firstChild);
    }

    // create table header
    const thd = createTr('_xColumn', '_yColumn');        
    tbl.appendChild(thd);

    // create table body and add rows one-by-one
    const tbdy = document.createElement('tbody');
    for (let i=0; i < data.length; i++) {  
        const tr = createTr(data[i].x, data[i].y);
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
}

// creates a <tr> with two <td> cells and populates them with text1 and text2 variables
const createTr = (text1, text2) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.style.border = '1px solid black';
    td2.style.border = '1px solid black';
    td1.appendChild(document.createTextNode(text1));
    td2.appendChild(document.createTextNode(text2));
    tr.appendChild(td1);
    tr.appendChild(td2);
    return tr;
}

// a work in progress.  
// enhancement - stop streaming
// enhancement - add data to table row by row as received rather than waiting for DRAWFREQ
// enhancement - add a flag to optionally allow removal of old streaming data
const startStreaming = async() => {
    let DATAPERSEC = 30; // number of datapoints per second
    let DRAWFREQ = 90; // after this number of datapoints, chart is re-drawn

    DATAPERSEC = 600;
    DRAWFREQ = 600;

    const chart = document.getElementById("chart");
    
    // erase table data and chart
    drawTable([]); 
    chart.data = [];
    chart._updateData();

    let streamData = [];
    let i=0;

    await cdsvc.startStreaming(DATAPERSEC, async function(x,y) {
        console.log(x,y)
        const obj = { x, y};
        streamData.push(obj);
        i++;
        if ((i % DRAWFREQ) === 0) {
            console.log("draw. length=" + streamData.length);

            // removes old streaming data
            // if (streamData.length >= (DRAWFREQ * 2))
            //     streamData.splice(0,DRAWFREQ)

            chart.data = streamData;
            chart._updateData()
            drawTable(streamData);  
        }
    })
}
