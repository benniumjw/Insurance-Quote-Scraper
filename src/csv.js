function exportCSVFile(headers, items, fileTitle) {
    // if (headers) {
    //     items.unshift(headers);
    // }

    console.log(headers, items)
    var str = headers.join(',') + '\r\n';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var line = [];
        for(var k in headers) {
          var header = headers[k];
          line.push(item[header].replace(/,/g, ' '));
        }
        str += line.join(',') + '\r\n';
    }
    console.log(str);
    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([str], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}


export default {
  exportCSVFile: exportCSVFile
}
