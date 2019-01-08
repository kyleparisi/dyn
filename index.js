const AWS = require("aws-sdk");

function Dyn(docClient) {
  docClient = docClient || new AWS.DynamoDB.DocumentClient();

  const reader = new Proxy(
    {},
    {
      get: function(target, name) {
        const params = {
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
    }
  );

  const query = new Proxy(
    {},
    {
      get: function(target, name) {
        const keyExpression = {
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

        const params = {
          TableName: name
        };
        return new Proxy(params, keyExpression);
      }
    }
  );

  const queryAndFilter = {
    get: function(target, name) {
      const filter = {
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

      const query = {
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

      var params = {
        TableName: name
      };
      return new Proxy(params, query);
    }
  };

  const scan = new Proxy(
    {},
    {
      get: function(target, name) {
        const keyScanExpression = {
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
        const params = {
          TableName: name
        };
        return new Proxy(params, keyScanExpression);
      }
    }
  );

  return {
    reader,
    query,
    queryAndFilter,
    scan
  };
}

module.exports = Dyn;
