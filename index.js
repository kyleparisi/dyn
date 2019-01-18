function Dyn(docClient) {
  if (!docClient) {
    throw new Error("docClient is required for library to wrap");
  }

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

      const params = {
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

  const create = new Proxy(
    {},
    {
      set: function(obj, prop, value) {
        const params = {
          TableName: prop,
          Item: value
        };
        return docClient.put(params).promise();
      }
    }
  );

  const update = new Proxy(
    {},
    {
      get: function(target, name) {
        const updateExpression = {
          get: function(target, name) {
            target.UpdateExpression = name;
            target.ReturnValues = "ALL_NEW";
            return values => {
              target.ExpressionAttributeValues = values;
              return docClient.update(target).promise().then(item => item.Attributes);
            };
          }
        };
        const table = function(params) {
          return () => params;
        };
        const keySelection = {
          apply: function(fn, thisArg, argumentsList) {
            const target = fn();
            target.Key = argumentsList[0];
            return new Proxy(target, updateExpression);
          }
        };
        const params = {
          TableName: name
        };
        return new Proxy(table(params), keySelection);
      }
    }
  );

  const del = new Proxy({}, {
    get: function (target, name) {
      const table = function(params) {
        return () => params;
      };
      const keySelection = {
        apply: function(fn, thisArg, argumentsList) {
          const target = fn();
          target.Key = argumentsList[0];
          return docClient.delete(target).promise();
        }
      };
      const params = {
        TableName: name
      };
      return new Proxy(table(params), keySelection);
    }
  });

  return {
    // Create
    create,

    // Read
    reader,
    query,
    queryAndFilter,
    scan,

    // Update
    update,

    // Delete
    del
  };
}

module.exports = Dyn;
