import React, { useState, useEffect, useRef } from "react";
import { OutTable, ExcelRenderer } from "react-excel-renderer";
import { extractSheetData } from "../util/util.js";
import { downloadExcel, DownloadTableExcel } from "react-export-table-to-excel";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState({});
  const [newSums, setNewSums] = useState([]);

  useEffect(() => {
    chartData();
  }, [data]);

  let fileHandler = function (event) {
    let fileObj = event.target.files[0];

    //pass fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log("error", err);
      } else {
        // setData({
        //     cols: resp.cols,
        //     rows: resp.rows
        // })
        setData(extractSheetData(resp.rows));
      }
    });
  };

  const groupBySum = (
    items,
    groupByProp,
    sumProp,
    keyProp,
    valueProp,
    isCurrent,
    isFuture,
    monthProp
  ) => {
    const date = new Date();

    function mydate(date) {
      return new Date(date);
    }
    function getLastDayOfMonth(year, month) {
      return new Date(year, month + 1, -2);
    }
    // 👇️ Last Three Day of CURRENT MONTH
    function checkThreeDaysBeforeMonth() {
      const lastDayCurrentMonth = getLastDayOfMonth(
        date.getFullYear(),
        date.getMonth()
      );

      if (new Date() > lastDayCurrentMonth) {
        return true;
      } else {
        return false;
      }
    }
    //console.log(!checkThreeDaysBeforeMonth());
    function isGoToNextYear(monthIdx, dateIdx) {
      if (
        mydate(
          `${
            date.getMonth() + monthIdx
          }/${date.getDate()}/${date.getFullYear()}`
        ) >= mydate(`12/31/${date.getFullYear()}`)
      ) {
        return `${date.getMonth() + monthIdx - 12}/${dateIdx}/${
          date.getFullYear() + 1
        }`;
      } else if (
        mydate(
          `${
            date.getMonth() + monthIdx
          }/${date.getDate()}/${date.getFullYear()}`
        ) <= mydate(`12/31/${date.getFullYear()}`)
      ) {
        return `${date.getMonth() + monthIdx}/${dateIdx}/${date.getFullYear()}`;
      }
    }
    var groups = new Map();

    const filterItems =
      items &&
      items.filter(function (it) {
        it.Total_Amount = Number(it.Open_Qty) * Number(it.Unit_Price);

        if (isCurrent && !isFuture) {
          if (checkThreeDaysBeforeMonth()) {
            return (
              mydate(it.Delivery_Date) >= mydate(`${date.getMonth()}/1/2018`) &&
              mydate(it.Delivery_Date) <=
                mydate(
                  `${isGoToNextYear(monthProp + 1, 22)}`
                  //`${date.getMonth() + monthProp + 1}/22/${date.getFullYear()}`
                )
            );
          } else if (!checkThreeDaysBeforeMonth()) {
            return (
              mydate(it.Delivery_Date) >= mydate(`${date.getMonth()}/1/2018`) &&
              mydate(it.Delivery_Date) <=
                mydate(
                  `${isGoToNextYear(monthProp, 22)}`
                  //`${date.getMonth() + monthProp}/22/${date.getFullYear()}`
                )
            );
          }
        } else if (!isCurrent && !isFuture) {
          if (checkThreeDaysBeforeMonth()) {
            return (
              mydate(it.Delivery_Date) >=
                mydate(
                  `${isGoToNextYear(monthProp, 23)}`
                  //`${date.getMonth() + monthProp}/23/${date.getFullYear()}`
                ) &&
              mydate(it.Delivery_Date) <=
                mydate(
                  `${isGoToNextYear(monthProp + 1, 22)}`
                  //`${date.getMonth() + monthProp + 1}/22/${date.getFullYear()}`
                )
            );
          } else if (!checkThreeDaysBeforeMonth()) {
            return (
              mydate(it.Delivery_Date) >=
                mydate(
                  `${isGoToNextYear(monthProp - 1, 23)}`
                  //`${date.getMonth() + monthProp - 1}/23/${date.getFullYear()}`
                ) &&
              mydate(it.Delivery_Date) <=
                mydate(
                  `${isGoToNextYear(monthProp, 22)}`
                  //`${date.getMonth() + monthProp}/22/${date.getFullYear()}`
                )
            );
          }
        } else if (!isCurrent && isFuture) {
          if (checkThreeDaysBeforeMonth()) {
            return (
              mydate(it.Delivery_Date) >=
                mydate(
                  `${isGoToNextYear(monthProp, 23)}`
                  //`${date.getMonth() + 3}/23/${date.getFullYear()}`
                ) && mydate(it.Delivery_Date) <= mydate(`12/31/2050`)
            );
          } else if (!checkThreeDaysBeforeMonth()) {
            return (
              mydate(it.Delivery_Date) >=
                mydate(
                  `${isGoToNextYear(monthProp - 1, 23)}`
                  //`${date.getMonth() + 3}/23/${date.getFullYear()}`
                ) &&
              //mydate(`12/31/22`) &&
              mydate(it.Delivery_Date) <= mydate(`12/31/2050`)
            );
          }
        }
      });

    console.log("filterItems", filterItems);

    for (const item of filterItems) {
      if (item[groupByProp] && item[sumProp]) {
        const groupBy = item[groupByProp];
        if (groups.has(groupBy)) {
          const currentValue = groups.get(groupBy);
          groups.set(groupBy, currentValue + item[sumProp]);
        } else {
          groups.set(groupBy, item[sumProp]);
        }
      }
    }

    const sums = [];
    groups.forEach((value, key, m) => {
      sums.push({
        // [groupByProp]: key,
        // [sumProp]: value,
        [keyProp]: key,
        [valueProp]: value,
      });
    });
    console.log("sum", sums);
    return sums;
  };

  async function chartData() {
    const items = data;
    //const groups = groupBySum(items, "Customer_Name", "Total_Amount");
    //let groups;

    //method 1:
    // for (let i = 1; i <= 4; i++) {
    //   switch (i) {
    //     case 1:
    //       groupBySum(
    //         items,
    //         "Customer_Name",
    //         "Total_Amount",
    //         "This_Month",
    //         "This_Total",
    //         true,
    //         false,
    //         1
    //       );
    //       break;
    //     case 2:
    //       groupBySum(
    //         items,
    //         "Customer_Name",
    //         "Total_Amount",
    //         "Next_Month",
    //         "Next_Total",
    //         false,
    //         false,
    //         2
    //       );
    //       break;
    //     case 3:
    //       groupBySum(
    //         items,
    //         "Customer_Name",
    //         "Total_Amount",
    //         "Two_Month",
    //         "Two_Total",
    //         false,
    //         false,
    //         3
    //       );
    //       break;
    //     case 4:
    //       groupBySum(
    //         items,
    //         "Customer_Name",
    //         "Total_Amount",
    //         "Future_Month",
    //         "Future_Total",
    //         false,
    //         true,
    //         4
    //       );
    //       break;
    //   }
    // }

    //mtehod 2:
    //  function atOnce(...fns) {
    //   return function(...args) {
    //     for (const fn of fns){
    //       fn.apply(this, args)
    //     }
    //   }
    // }

    // let one = atOnce(groupBySum(
    //   items,
    //   "Customer_Name",
    //   "Total_Amount",
    //   "This_Month",
    //   "This_Total",
    //   true,
    //   false,
    //   1
    // ), groupBySum(
    //   items,
    //   "Customer_Name",
    //   "Total_Amount",
    //   "Next_Month",
    //   "Next_Total",
    //   false,
    //   false,
    //   2
    // ), groupBySum(
    //   items,
    //   "Customer_Name",
    //   "Total_Amount",
    //   "Two_Month",
    //   "Two_Total",
    //   false,
    //   false,
    //   3
    // ), groupBySum(
    //   items,
    //   "Customer_Name",
    //   "Total_Amount",
    //   "Future_Month",
    //   "Future_Total",
    //   false,
    //   true,
    //   4
    // ))

    //method 3:
    const p1 = new Promise((resolve, reject) => {
      resolve(
        groupBySum(
          items,
          "Customer_Name",
          "Total_Amount",
          "This_Month",
          "This_Total",
          true,
          false,
          1
        )
      );
    });

    const p2 = new Promise((resolve, reject) => {
      resolve(
        groupBySum(
          items,
          "Customer_Name",
          "Total_Amount",
          "Next_Month",
          "Next_Total",
          false,
          false,
          2
        )
      );
    });

    const p3 = new Promise((resolve, reject) => {
      resolve(
        groupBySum(
          items,
          "Customer_Name",
          "Total_Amount",
          "Two_Month",
          "Two_Total",
          false,
          false,
          3
        )
      );
    });

    const p4 = new Promise((resolve, reject) => {
      resolve(
        groupBySum(
          items,
          "Customer_Name",
          "Total_Amount",
          "Future_Month",
          "Future_Total",
          false,
          true,
          4
        )
      );
    });

    await Promise.all([p1, p2, p3, p4]).then((results) => {
      let flatten = results.flat();
      console.log("result,", flatten);
      setNewSums(flatten);
    });

    //return newSums;
  }
  console.log("newSums", newSums);

  //method 4:
  // async function waitAlittle() {
  //   await new Promise((resolve, reject) => resolve(chartData()))

  //   let groups = await sums;

  //   console.log('awaited')

  //    return groups;
  // }

  // waitAlittle().then(value=>{
  //   console.log('value', value)
  //   //setNewSums((prev)=>[...prev, value]) //causing non stop looping problem
  //   console.log(newSums)
  // });

  let formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const header = [
    "This_Month",
    "This_Total",
    "Next_Month",
    "Next_Total",
    "Two_Month",
    "Two_Total",
    "Future_Month",
    "Future_Total",
  ];

  //for pre-set data only:
  // const body = [
  //   ["Edison", "Padilla", 14],
  //   ["Cheila", "Rodrigez", 56],
  // ];

  // const body2 = [
  //   { This_Month: "AMAZON.COM (DI) Aurora Brand", This_Total: 678101.8 },
  //   { This_Month: "AMAZON.COM (DI) Aurora Brand", This_Total: 678101.8 },
  // ];

  // function handleDownloadExcel() {
  //   downloadExcel({
  //     fileName: "Sales Order Report Sort -> downloadExcel method",
  //     sheet: "SO PT",
  //     tablePayload: {
  //       header,
  //       // accept two different data structures
  //       body: body || body2,
  //     },
  //   });
  // }

  const tableRef = useRef(null);

  return (
    <div>
      <DownloadTableExcel
        filename="Mike's Sales Order Table"
        sheet="SO PT"
        currentTableRef={tableRef.current}
      >
        <button> Export excel </button>
      </DownloadTableExcel>
      <table className="table" ref={tableRef}>
        <tbody>
          <tr>
            {header.map((head) => (
              <th key={head}> {head} </th>
            ))}
          </tr>
          {newSums &&
            newSums.map((item, i) => (
              <tr key={i}>
                <td className="tableData" key={item.This_Month}>
                  {item.This_Month}
                </td>
                <td className="tableData" key={item.This_Total}>
                  {item.This_Total && formatter.format(item.This_Total)}
                </td>
                <td className="tableData" key={item.Next_Month}>
                  {item.Next_Month}
                </td>
                <td className="tableData" key={item.Next_Total}>
                  {item.Next_Total && formatter.format(item.Next_Total)}
                </td>
                <td className="tableData" key={item.Two_Month}>
                  {item.Two_Month}
                </td>
                <td className="tableData" key={item.Two_Total}>
                  {item.Two_Total && formatter.format(item.Two_Total)}
                </td>
                <td className="tableData" key={item.Future_Month}>
                  {item.Future_Month}
                </td>
                <td className="tableData" key={item.Future_Total}>
                  {item.Future_Total && formatter.format(item.Future_Total)}
                </td>
              </tr>
              // console.log("item", Object.keys(item).filter((key) => key.includes("This_Month"))
              //             .reduce((cur, key) => {return Object.assign(cur, {[key]: item[key]})}, {})
              // )
            ))}
        </tbody>
      </table>
      <div>
        <input type="file" onChange={fileHandler} style={{ padding: "10px" }} />
        {"           Made by Mike Chen"}
      </div>
    </div>
  );
};

export default Dashboard;
