const axios = require('axios')

axios({
    method: 'post',
    url: 'https://api.hotpot.ai/make-art',
    responseType: 'json',
    headers: {
      Authorization: "Gzl8WfXr3SjDa6l9MU2UMNA9M2Syb29H5y5gcrNuQRDdM"
    },
    params: {
      inputText: "letter"
    }
}).then( function (results) {
    console.log(results)
})

// var imageurl = "https://hotpotmedia.s3.us-east-2.amazonaws.com/ypr3uvUcr19fNabON73WVO.png"

// axios({
//     method: 'get',
//     url: imageurl,
//     responseType: 'stream',
//     headers: {
//               Authorization: "Gzl8WfXr3SjDa6l9MU2UMNA9M2Syb29H5y5gcrNuQRDdM"
//             }
// }).then( function(results) {
//     console.log(results)
//     results.data.pipe(fs.createWriteStream("./test.png"));
// })