// readfilesync to read text file from local directory
const fs = require('fs');
let salesDataTxt = fs.readFileSync("sales-data.txt",'utf8');

// convert txt to json 
const salesGroupedByDate = {}
salesDataTxt.split('\n').map((row,index)=>{
    if(index==0)
        return false
    let date = row.split(',')[0]
    let month = date.split('-')[0]+'-'+date.split('-')[1]
    
    // check if date exist in group by date else add a new group of object    
    // create month to group
    if(!(month in salesGroupedByDate)){
        salesGroupedByDate[month] = {
            'products':[],
            monthly_sales:0,
            most_revenue:0
        }
    }
    // calculate total sales per month
    salesGroupedByDate[month]['monthly_sales'] = salesGroupedByDate[month]['monthly_sales'] + parseFloat(row.split(',')[4])

    // add product name to monthly sales
    var productIndex = salesGroupedByDate[month]['products'].findIndex((item) => item.name == row.split(',')[1])
    if(productIndex<0){
        salesGroupedByDate[month]['products'].push({
            name:row.split(',')[1],
            total_sold:0,
            total_sales_per_month:0,
            min_qty_sold:999,
            max_qty_sold:0,
            total_orders:0,
            product_list:[]
        })
        productIndex = salesGroupedByDate[month]['products'].length -1
    }    

    // calculate total quantity sold per month
    salesGroupedByDate[month]['products'][productIndex]['total_sold'] = salesGroupedByDate[month]['products'][productIndex]['total_sold'] + parseInt(row.split(',')[3])
    // calculate total sales made by product per month
    salesGroupedByDate[month]['products'][productIndex]['total_sales_per_month'] = salesGroupedByDate[month]['products'][productIndex]['total_sales_per_month'] + parseFloat(row.split(',')[4])
    // calculate minimum sales made by product per month
    salesGroupedByDate[month]['products'][productIndex]['min_qty_sold'] = parseInt(row.split(',')[3]) <= salesGroupedByDate[month]['products'][productIndex]['min_qty_sold']?parseFloat(row.split(',')[3]):salesGroupedByDate[month]['products'][productIndex]['min_qty_sold']
    // calculate maximum sales made by product per month
    salesGroupedByDate[month]['products'][productIndex]['max_qty_sold'] = parseInt(row.split(',')[3]) >= salesGroupedByDate[month]['products'][productIndex]['max_qty_sold']?parseFloat(row.split(',')[3]):salesGroupedByDate[month]['products'][productIndex]['max_qty_sold']
    // add product details row to monthly sales
    salesGroupedByDate[month]['products'][productIndex]['total_orders'] = salesGroupedByDate[month]['products'][productIndex]['total_orders'] + 1
    
})


var item_schema = { 
    "name": "",
    "total_sold": 0,
    "total_sales_per_month": 0,
    "min_qty_sold": 0,
    "max_qty_sold": 0,
    "total_orders": 0
}

var totalSales = 0
var monthly_sales = "------------- Total sales by Month --------------\nMonth \t\t\t\t\t Total"
var most_popular_item = "------------ Most Popular Item by Month------------\nMonth \t\t Item Name \t\t Qty Sold \t Minimum Qty \t Maximum Qty \t\t Average Qty"
var most_revenue_item = "------------- Most Revenue by Month --------------\nMonth \t\t Item Name \t\t Total Revenue"

// generate the min,max,average,most revenue for each month

for(key in salesGroupedByDate){
    let result = salesGroupedByDate[key]['products'].reduce((monthlyReport,product_report)=>{
        return monthlyReport = {
            // compare the generated monthly report by product with temp values to generate popular Item & item with highest revenue by month
            /*
                1. compare the popular item sold with initial values and set it as a popular value
                2. compare the total sales made by product with initial values to most generated revenue
            */
            popular_item : product_report.total_sold >= monthlyReport.popular_item.total_sold?product_report:monthlyReport.popular_item,
            item_with_most_revenue:product_report.total_sales_per_month>=monthlyReport.popular_item.total_sales_per_month?product_report:monthlyReport.item_with_most_revenue
        }
    },
    { 
        popular_item : item_schema,
        item_with_most_revenue: item_schema
    })
    totalSales = totalSales + salesGroupedByDate[key]['monthly_sales']
    monthly_sales = monthly_sales.concat("\n"+key,"\t\t\t\t\t",salesGroupedByDate[key]['monthly_sales'])
    most_popular_item = most_popular_item.concat("\n"+key+'\t\t'+result.popular_item.name+'\t\t'+result.popular_item.total_sold+'\t\t'+result.popular_item.min_qty_sold+'\t\t'+result.popular_item.max_qty_sold+'\t\t'+(result.popular_item.total_sold/result.popular_item.total_orders).toFixed(2))
    most_revenue_item = most_revenue_item.concat("\n"+key+'\t\t'+result.item_with_most_revenue.name +'\t\t'+result.item_with_most_revenue.total_sales_per_month)
}
console.log('------------- Total Sales --------------- '+totalSales)
console.log(monthly_sales)
console.log(most_popular_item)
console.log(most_revenue_item)


