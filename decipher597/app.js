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

        //Run Python Script 
        let largeDataSet = [];

        var child = exec('decipherscript.exe');
        child.stdout.on('data', function(data) {
            console.log('Pipe data from python script ...')
            largeDataSet.push(data)
        });
        
        child.on('close', function() {
            console.log(`child process close all stdio`);
            return res.redirect('pages/finalpage.html');
            // return setTimeout(function () {res.redirect('pages/finalpage.html');}, 30000); 
        });

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

    //Run Python Script 
    let largeDataSet = [];

    var child = exec('decipherscript.exe');
    child.stdout.on('data', function(data) {
        console.log('Pipe data from python script ...')
        largeDataSet.push(data)
    });
    
    child.on('close', function() {
        console.log(`child process close all stdio`);
        return res.redirect('pages/finalpage.html');
        // return setTimeout(function () {res.redirect('pages/finalpage.html');}, 30000); 
    });

    //Download title of Video from Blob
    blobDownload();

})


app.get('/',function(req,res){
    res.set({
	    'Access-control-Allow-Origin': '*'
    });
    return res.redirect('index.html');
}).listen(port)


console.log(`Server running at http://localhost:${port}`);

app.use(express.static(__dirname + '/public'));