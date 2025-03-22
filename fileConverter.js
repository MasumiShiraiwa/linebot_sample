const { datacatalog } = require("googleapis/build/src/apis/datacatalog");

/**
 * Convert Excel file to TXT file
 * @param {Array} excelData - list of Excel file data
 * @returns {Array} textData - list of TXT file data
 */
let excelToTxt = (excelData) => {
    // ファイルデータを配列として受け取る
    // 配列の中身は、[
    //     [
    //         
    //     ]
    
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
    console.log(typeof(excelData), excelData)
    console.log(excelData[0][0],excelData[0][1],excelData[1][0])
    let textData = [];
    const idCol = 0; // 【要変更】社員IDの列
    const totalRow = 0; // 【要変更】"Total"の列
    let col = 2; // シフト表の最初の列で初期化
    while(true){
        if(excelData[totalRow][col] === "Total"){ //【要変更】"Total"の列で終了
            break;
        };

        let date = [];
        //ここから各行を見ていく
        //まず、０列目に社員IDがあれば(=nullでなければ)、colの列を取得する
        let row = 2; //【要変更】最初に社員IDがある行(荒川さんの行)で初期化
        while(excelData[row][idCol] != null){
            date.push({
                id: excelData[row][idCol],
                time: excelData[row+1][col],
            });
            row++; //【要変更】 ２つ飛ばしの場合は？
        }

        // textData.push(JSON.parse(JSON.stringify(date)));
        textData.push(date);
        col++;
    }

    console.log("textData: ", textData);

    return textData;
};

module.exports = {
    excelToTxt,
};
