const AWS = require("aws-sdk");
const BUCKET_DELIVERY = "nookvar-delivery-files";

function removeFromS3Bucket(key) {
  let s3 = new AWS.S3();
  var Delivery02 = {
    Bucket: BUCKET_DELIVERY,
    Key: key
  };

  s3.deleteObject(Delivery02, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("deleted from deliveryted");
    }
  });
}

module.exports = removeFromS3Bucket;
