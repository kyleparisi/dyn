const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
  apiVersion: "2012-08-10"
});

var table = {
  get: function(target, name) {
    var params = {
      TableName: name
    };
    return keys => {
      params.Key = keys;
      return docClient
        .get(params)
        .promise()
        .then(doc => doc.Item);
    };
  }
};

var reader = new Proxy({}, table);
(async () => {
  //	console.log(await reader.Movies({
  //		year: 2013,
  //		title: "2 Guns"
  //	}));
  //	Will fail key schema
  //	console.log(await reader.Movies({
  //		year: 1985
  //	}));
})();

var keyExpression = {
  get: function(target, name) {
    const regex = /#(\w+)/gm;
    let m;

    target.ExpressionAttributeNames = {};

    while ((m = regex.exec(name)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      target.ExpressionAttributeNames[m[0]] = m[1];
    }
    if (!Object.keys(target.ExpressionAttributeNames).length) {
      delete target.ExpressionAttributeNames;
    }

    target.KeyConditionExpression = name;
    return keys => {
      target.ExpressionAttributeValues = keys;
      return docClient
        .query(target)
        .promise()
        .then(doc => doc.Items);
    };
  }
};
var table = {
  get: function(target, name) {
    var params = {
      TableName: name
    };
    return new Proxy(params, keyExpression);
  }
};
var query = new Proxy({}, table);
(async () => {
  //	console.log(await query.Movies["#year = :yyyy"]({
  //		":yyyy": 2009
  //	}));
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

var filter = {
  get: function(target, name) {
    console.log(target, name);
    if (name) {
      target.FilterExpression = name;
    }
    return keys => {
      target.ExpressionAttributeValues = keys;
      return docClient
        .query(target)
        .promise()
        .then(doc => doc.Items);
    };
  }
};

var query = {
  get: function(target, name) {
    const regex = /#(\w+)/gm;
    let m;

    target.ExpressionAttributeNames = {};

    while ((m = regex.exec(name)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      target.ExpressionAttributeNames[m[0]] = m[1];
    }
    if (!Object.keys(target.ExpressionAttributeNames).length) {
      delete target.ExpressionAttributeNames;
    }

    target.KeyConditionExpression = name;
    return new Proxy(target, filter);
  }
};

var table = {
  get: function(target, name) {
    var params = {
      TableName: name
    };
    return new Proxy(params, query);
  }
};
var queryAndFilter = new Proxy({}, table);
(async () => {
  console.log(
    await queryAndFilter.Movies["#year = :year and begins_with(title, :title)"][
      "rated = :rated"
    ]({
      ":title": "A",
      ":year": 2013,
      ":rated": "PG"
    })
  );
})();

var keyScanExpression = {
  get: function(target, name) {
    const regex = /#(\w+)/gm;
    let m;

    target.ExpressionAttributeNames = {};
    while ((m = regex.exec(name)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      target.ExpressionAttributeNames[m[0]] = m[1];
    }
    if (!Object.keys(target.ExpressionAttributeNames).length) {
      delete target.ExpressionAttributeNames;
    }
    if (name) {
      target.FilterExpression = name;
    }

    return keys => {
      target.ExpressionAttributeValues = keys;
      return docClient
        .scan(target)
        .promise()
        .then(doc => doc.Items);
    };
  }
};
var table = {
  get: function(target, name) {
    var params = {
      TableName: name
    };
    return new Proxy(params, keyScanExpression);
  }
};
var scan = new Proxy({}, table);
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
