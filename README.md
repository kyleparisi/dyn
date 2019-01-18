# Dyn

Super crude idea for a library to talk with dynamodb.  Does not handle paging at the moment.  An interesting use of js proxies.

See [dyn_data](https://github.com/kyleparisi/dyn_data) for some data.

## Create

```js
// create[table] = {}

create.ProductCatalog = {
  Id: 500,
  Price: 222,
  ProductCategory: "Bicycle",
  Title: "99-Bike-212",
  BicycleType: "Hybrid",
  Brand: "Brand 212",
  Color: ["Red"],
  Description: "212 Description"
}
```

## Read

Basic key/value:

```js
// reader[table]({partitionkey: value, [sortkey: value]})

await reader.Movies({
	year: 2013,
	title: "2 Guns"
})
```

Query:

```js
// query[table]["key condition template"]({template_var: value})

// note: year is a reserved keyword, hence the # sign
await query.Movies["#year = :yyyy"]({
	":yyyy": 2009
})

await query.Movies["#year = :yyyy and title between :letter1 and :letter2"]({
	":yyyy": 2009,
	":letter1": "A",
	":letter2": "L"
})
```

Query and Filter:

```js
// queryAndFilter[table]["key condition template"]["filter condition template"]({template_var: value})

await queryAndFilter.Movies["#year = :year and begins_with(title, :title)"]["rated = :rated"]({
	":title": "A",
	":year": 2013,
	":rated": "PG"
})
```

Scan:

```js
// scan[table]["filter condition template"]({template_var: value})

// note: year is a reserved keyword, hence the # sign
await scan.Movies["#year between :start_yr and :end_yr"]({
	":start_yr": 2009,
	":end_yr": 2018
})

await scan.ProductCatalog["id between :start and :end"]({
	":start": 200,
	":end": 300
})

// get the whole table (within dynamodb limits)
await scan.ProductCatalog[""]()
```

## Update

Update:

```js
// update[table]({partitionkey: value, [sortkey: value]})["update expression template"]({template_var: value})

await update.ProductCatalog({Id: 500})["set Price = :price"]({
    ":price": 300
})

await update.ProductCatalog({Id: 500})["set Color = :color"]({
    ":color": ["Green"]
})

const product500 = update.ProductCatalog({Id: 500});
const product205 = update.ProductCatalog({Id: 205});
await product500["set Color = :color"]({
    ":color": ["Yellow"]
});
await product205["set Color = :color"]({
    ":color": ["Yellow"]
})
```

Update Conditionally:

```js
// updateConditionally[table]({partitionkey: value, [sortkey: value]})["conditional template"]["update expression template"]({template_var: value})

try {
    await updateConditionally.ProductCatalog({Id: 202})["Price < :price"]["set Price = :price"]({
        ":price": 500
    });
} catch(e) {
    if (e.code === "ConditionalCheckFailedException") {
        // no update found
    }
}
```

## Delete

```js
// del[table](partitionkey: value, [sortkey: value]})

await del.ProductCatalog({Id: 500})
```
