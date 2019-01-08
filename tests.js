const AWS = require("aws-sdk");
const Dyn = require("./index.js");

AWS.config.region = "us-east-1";
const { reader, query } = new Dyn(new AWS.DynamoDB.DocumentClient());

(async () => {
  console.log(await reader.Movies({
  	year: 2013,
  	title: "2 Guns"
  }));
  //	Will fail key schema
  //	console.log(await reader.Movies({
  //		year: 1985
  //	}));
})();

(async () => {
  // console.log(await query.Movies["#year = :yyyy"]({
  // 	":yyyy": 2009
  // }));
  //
  //	console.log(await query.Movies["#year = :yyyy and title between :letter1 and :letter2"]({
  //		":yyyy": 2009,
  //		":letter1": "A",
  //		":letter2": "L"
  //	}));
  //
  //	console.log(await query.Movies["#year = :year and begins_with(title, :title)"]({
  //		":title": "A",
  //		":year": 2013
  //	}));
})();

(async () => {
  // console
  //   .log
    // await queryAndFilter.Movies["#year = :year and begins_with(title, :title)"][
    //   "rated = :rated"
    // ]({
    //   ":title": "A",
    //   ":year": 2013,
    //   ":rated": "PG"
    // })
})();

(async () => {
  //	console.log(await scan.Movies["#year between :start_yr and :end_yr"]({
  //		":start_yr": 2009,
  //		":end_yr": 2018
  //	}));
  //
  //	console.log(await scan.ProductCatalog["Id between :start and :end"]({
  //		":start": 200,
  //		":end": 300
  //	}));
  //
  //	console.log(await scan.ProductCatalog[""]());
})();
