const columnMappings = {
    "#": "#",
    "SO No.": "SO_No.",
    "Posting Date": "Posting_Date",
    "Customer Code": "Customer_Code",
    "Customer Name": "Customer_Name",
    "Customer PO": "Customer_PO",
    "Item No.": "Item_No.",
    "Order Qty": "Order_Qty",
    "Open Qty": "Open_Qty",
    "Delivery Date": "Delivery_Date",
    "ETD from Port": "ETD_from_Port",
    "Warehouse": "Warehouse",
    "Unit Price": "Unit_Price",
    "Total Amount": "Total_Amount",
  };

const objectToArray = (dataObject) => {
    return Object.keys(dataObject).map((idx) => dataObject[idx]);
}

const extractColumns = (columnObject) => {
    const columns = objectToArray(columnObject).filter(
        (c) => c.value !== "ETD from port"
    )
    const columnNames = columns.map((obj)=> columnMappings[obj]);
    return columnNames;
}

export const extractSheetData = (excelData) => {
    //const rawData = JSON.parse(JSON.stringify(excelData))

    console.log('rawData', excelData)

    const columnNames = extractColumns(excelData.shift());

    console.log('columnNames', columnNames)

    const newSheetData = [];

    for (const row of excelData) {
        const rowData = {};
        //const rowArray = objectToArray(row);
        row.forEach((val, idx) => {
            rowData[columnNames[idx]] = val;
        });
        newSheetData.push(rowData);
    }
    
    console.log('newSheetData', newSheetData)
    
    return newSheetData;
}