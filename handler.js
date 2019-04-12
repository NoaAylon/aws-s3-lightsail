const AWS = require("aws-sdk");
const fs = require("fs");

const removeFromS3Bucket = require("./helpers/removeFromS3Bucket");
const notifySlack = require("./helpers/notifySlack");

const configs = require("./configs");
const BUCKET_DELIVERY = configs.BUCKET_DELIVERY;
const BUCKET_ARCHIVE = configs.BUCKET_ARCHIVE;
const BUCKET_BAD_FILES = configs.BUCKET_BAD_FILES;

const IAM_USER_KEY = configs.IAM_USER_KEY;
const IAM_USER_SECRET = configs.IAM_USER_SECRET;

const webhookUri = configs.WEBHOOK_URI;

AWS.config.update({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
});

let s3 = new AWS.S3();
let fileName;
let length;
let fileBody;

var Delivery01 = {
  Bucket: BUCKET_DELIVERY
};

s3.listObjects(Delivery01, function(err, Data) {
  if (err) {
    console.error(err);
  }
  length = Data.Contents.length;

  for (i = 0; i < length; ++i) {
    fileName = Data.Contents[i].Key;

    let Delivery02 = {
      Bucket: BUCKET_DELIVERY,
      Key: fileName
    };

    let Archive = {
      Bucket: BUCKET_ARCHIVE,
      CopySource: `/${BUCKET_DELIVERY}/${fileName}`,
      Key: fileName
    };

    let Trash = {
      Bucket: BUCKET_BAD_FILES,
      CopySource: `/${BUCKET_DELIVERY}/${fileName}`,
      Key: fileName
    };

    const copy = Object.assign({}, Delivery02);

    s3.getObject(copy, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        fileBody = data.Body.toString();

        if (fileBody.includes("@@")) {
          s3.copyObject(Trash, function(copyErr, copyData) {
            if (copyErr) {
              console.log(copyErr);
              return;
            }
            notifySlack(webhookUri);
            removeFromS3Bucket(copy.Key);
          });
        } else {
          s3.copyObject(Archive, function(err, copyData) {
            if (err) {
              console.log(err);
            } else {
              removeFromS3Bucket(copy.Key);
            }
          });
        }
      }
    });
  }
});
