const { datacatalog } = require("googleapis/build/src/apis/datacatalog");

/**
 * Convert Excel file to TXT file
 * @param {Array} excelData - list of Excel file data
 * @returns {Array} textData - list of TXT file data
 */
let excelToTxt = async (excelData) => {
    // ファイルデータを配列として受け取る
    // 配列の中身は、[
    //     [
    //         
    //     ]
    
    let textData = [];
    // textDataの中身は、[
    //     [
    //         {
    //             id: "id".
    //             time: "time".
    //         }, ..., {}
    //     ],
    //     [
    //         {
    //             id: "id".
    //             time: "time".
    //         }, ..., {}
    //     ],
    // ]
    let col = 0;
    while(true){
        let date = [];
        //ここから各行を見ていく
        //まず、０列目に社員IDがあれば(=nullでなければ)、colの列を取得する
        let row = 0; //【要変更】最初に社員IDがある行
        while(excelData[row][0] !== null){
            date.push({
                id: excelData[row][0],
                time: excelData[row][col],
            });
            row++;
        }

        if(excelData[0][col] === "Total"){
            break;
        };
        textData.push(JSON.parse(JSON.stringify(date)));
        col++;
    }

    return textData;
};

module.exports = {
    excelToTxt,
};
