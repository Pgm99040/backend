const dev = {
    s3BaseUrl: 'https://s3.amazonaws.com/codediy-stg/',
    accessKeyId: 'AKIAJTMXDRZLZWUWW5WA',
    secretAccessKey: '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',
    region : 'ap-south-1',
    s3bucket: "codediy-stg"
};
const prod = {
    s3BaseUrl: 'https://s3.amazonaws.com/codediy-prod/',
    accessKeyId: 'AKIAJTMXDRZLZWUWW5WA',
    secretAccessKey: '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',
    region : 'ap-south-1',
    s3bucket: "codediy-prod"
};

const config = process.env.NODE_ENV === 'production'
    ? prod
    : dev;

module.exports = config;