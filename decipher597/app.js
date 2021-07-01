var fs = require('fs');
var express=require("express");
var bodyParser=require("body-parser");
const { spawn } = require('child_process');
var exec = require('child_process').execFile;
require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
var app=express();
const port = process.env.PORT || 8080;


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));

async function blobUpload() {
  // Create a container (folder) if it does not exist
  const containerName = 'videos';
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const createContainerResponse = await containerClient.createIfNotExists();
  console.log(`Create container ${containerName} successfully`, createContainerResponse.succeeded);

  const linkfile = 'input_link.txt';
  const linkBlobClient = containerClient.getBlockBlobClient(linkfile);
  linkBlobClient.uploadFile(linkfile);

  const langfile = 'language.txt';
  const langBlobClient = containerClient.getBlockBlobClient(langfile);
  langBlobClient.uploadFile(langfile);
}

async function blobDownload() {
  // Create a container (folder) if it does not exist
  const containerName = 'videos';
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const createContainerResponse = await containerClient.createIfNotExists();
  
  const vidtitle = 'write_title.txt';
  const vidtitleBlobClient = containerClient.getBlockBlobClient(vidtitle);
  vidtitleBlobClient.downloadToFile(vidtitle);
}

//Change Language Request From Home Page
app.post('/', function(req,res){
	var linkurl = req.body.linkurl;
	var lang =req.body.lang;

    //  Validating Youtube URL
    if( (linkurl != undefined || linkurl != '') ){
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        match = linkurl.match(regExp);
        i1 = (match && match[2].length == 11) ? true : false ;
    }
    else
    {
        i1 = false;
    }

    if(i1){
        // Link is validated
        // Write Linkurl and Language in File
        fs.writeFile('input_link.txt', linkurl, err => {
            if (err) {
                console.error(err)
                return
            }
        })

        fs.writeFile('language.txt', lang, err => {
            if (err) {
                console.error(err);
                return
            }
        })
        
        //Upload Link and Language Files in Blob 
        blobUpload();
       
        // Run python .exe file
        var fun =function(){
            console.log("fun() start");
            exec('decipherscript.exe', function(err, data) { 
                console.log(`child process close all stdio with code`);
                console.log(err);
                console.log(data.toString());                       
            });
            return res.redirect('pages/finalpage.html');  
        }
        fun();
        // return res.redirect('pages/finalpage.html'); 

        //Download title of Video from Blob
        blobDownload(); 
    }
    else{
        console.log("Link is not Validated. Empty/Incorrect URL");
    }
})

//Change Language Request From Final Page
app.post('/pages/finalpage', function(req,res){

	var lang =req.body.lang;
    fs.writeFile('language.txt', lang, err => {
        if (err) {
            console.error(err);
            return
        }
    })

    blobUpload();

    var fun =function(){
        console.log("fun() start");
        exec('decipherscript.exe', function(err, data) { 
            console.log(`child process close all stdio with code`);
            console.log(err);
            console.log(data.toString());                       
        });
        return res.redirect('pages/finalpage.html');  
    }
    fun();

    //Download title of Video from Blob
    blobDownload();

})


app.get('/',function(req,res){
    res.set({
	    'Access-control-Allow-Origin': '*'
    });
    return res.redirect('index.html');
}).listen(port)


// app.get('/pages/finalpage',function(req,res){

//     fs.readFile('write_title.txt', videotitle)
//     // Function to return 
//     async function videotitle (err, data)
//     {
//         var title;
//         /* If an error exists, show it, otherwise show the file */
//         err ? Function("error","throw error")(err) : (title = JSON.stringify(data) );
//         var objectValue = JSON.parse(title);
//         var video_title="";
//         for(i=0;i<objectValue['data'].length;i++){
//             // console.log(objectValue['data'][i]);
//             var res = String.fromCharCode(objectValue['data'][i]);
//             video_title+=res;
//         }
//         console.log(video_title);
//         res.send(video_title); 
//     };
// })


console.log(`Server running at http://localhost:${port}`);

app.use(express.static(__dirname + '/public'));