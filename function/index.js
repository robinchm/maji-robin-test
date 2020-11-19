const aws = require("aws-sdk");

const { parseCsv } = require("./validator.js");

exports.handler = function(event, context, callback) {
  let s3 = new aws.S3();
  s3.getObject({
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key,
  }, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      process(data.Body);
    }
  });
};

function process(body) {
  str = body.toString("utf8");
  try {
    let rows = parseCsv(str);
    writeToTable(rows);
    console.log("finished writing?");
  } catch(e) {
    console.log(e);
    publish(e);
  }
}

function writeToTable(rows) {
  let dynamodb = new aws.DynamoDB();
  dynamodb.listTables({}, function(err, data) {
    if (err) {
      throw err;
    } else if (data.TableNames.length == 0) {
        console.log("No DynamoDB tables available.");
    } else {
      params = buildWriteParam(data.TableNames[0], rows);
      console.log("Writing data to ", data.TableNames[0]);
      dynamodb.batchWriteItem(params, function(err, data) {
        if (err) {
          throw err;
        }
      });
    }
  });
}

function buildWriteParam(tableName, rows) {
  let param = {
    RequestItems: {
    }
  };
  param.RequestItems[tableName] = [];
  for (let row of rows) {
    param.RequestItems[tableName].push({
      PutRequest: {
        Item: {
          latitude: {
            N: row.latitude.toString(),
          },
          longitude: {
            N: row.longitude.toString(),
          },
          address: {
            S: row.address,
          },
        },
      },
    });
  }
  return param;
}

function publish(e) {
  let sns = new aws.SNS();
  sns.listTopics({}, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else if (data.Topics.length == 0) {
      console.log("No SNS topics available.");
      return;
    } else {
      let params = {
        Message: e.toString(),
        Subject: "Failed to parse csv",
        TopicArn: data.Topics[0].TopicArn,
      };
      console.log("Publishing error to ", params.TopicArn);
      sns.publish(params);
    }
  });
}
