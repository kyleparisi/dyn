# Dyn

Super crude idea for a library to talk with dynamodb.  Does not handle paging at the moment.  An interesting use of js proxies.

## [TODO] Create

`dyn[table] = {}`

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

## [TODO] Update

`dyn[table][param:value,param:value] = {}`

`dyn[table][param:value,param:value] = {'info.rating': 1, title: 'A cool movie'}`

How to update via inline modification:

`dyn[table][param:value,param:value] = {'info.rating': 'info.rating + 1'}`

## [TODO] Delete

`delete dyn[table][param:value,param:value]`
