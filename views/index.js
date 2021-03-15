//ToDo: refactor code into classes and modules
//speed coded please forgive the big mess :)

const electron = require('electron')
const path = require('path')
const axios = require('axios')
const os = require('os')
const fs = require("fs");

var archiver = require('archiver');
const { Certificate } = require('crypto');
const { get } = require('https');
const remote = electron.remote
var currentVideo = null;
var ipc = electron.ipcRenderer
var session = require('electron')
var app = remote.app
var videoPlayerId = 'plyrele'
var ajax = new AjaxRequest()
var cookieBar = new Cookie1()

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);


var currentVideoData = null
var videoSelectedState = false
var imageSelectedState = false
var imageBase64String = null
var muted = false
var firstPlay = false
var inputSuspended = false;
var askedToLogin = false
var logininit = false
var loginRequestActive = false

var archiveSize = 0

let manifestFiles = []

var videoPlayer;

const videoSelectBtn = document.getElementById('selectVideo')
const imageSelectBtn = document.getElementById('photonail')
const actionButton = document.getElementById('np_subm_btn')
const muteBtn = document.getElementById('muteBtn')
const removeVideoBtn = document.getElementById('removeVideo')


const videoSelectFormInput = document.getElementById('vidinp')
const thumbSelectFormInput = document.getElementById('imginp')
const videoContainer = document.getElementById('prevhldr')
const imagePreviewEl = document.getElementById('photonail')
const formElement = document.getElementById('subForm')

var isTranscoding = false
var transcoded = false
var packaged = false
var buttonText = "Transcode Video"



//progress nodes
const progressNodes = [
    document.getElementById('prg_1'),
    document.getElementById('prg_2'),
    document.getElementById('prg_3'),
    document.getElementById('prg_4'),
    document.getElementById('prg_5')
]

const activeClass = "is-active";
const completeClass = "is-complete";



const default_reg_file = {
    name: "Transcode Registry",
    appkpp: "",
    mixer: "",
    wan:"",
    lan:"",
    last_updated: 0,
    transcodes: {

    }
}
const progressData = {
    video: [0, false, false],
    thumb: [1, false, false],
    name: [2, false, false],
    complete: [3, false, false],
    upload: [4, false, false],
}

const transcodeDataModel = {
    videoId: '',
    fileDir: '',
    transcodeDir: 'dir',
    transcodeTime: 0,
    transcodeState: 0,


}


//action for button
actionButton.addEventListener('click', function (event) {

    
    if (inputSuspended) return
    if (progressData.video[1] && !transcoded) {
        if (!isTranscoding) {
            startTranscodeProcess()
        }

    } else if (transcoded && progressData.complete[1] && packaged) {
        startUploadProcess();
    }
})

imageSelectBtn.addEventListener('click', function (event) {
    if (inputSuspended) return

    thumbSelectFormInput.click()
})

videoSelectBtn.addEventListener('click', function (event) {
    if (inputSuspended) return

    videoSelectFormInput.click()
})

muteBtn.addEventListener('click', function (event) {
    togglemute()
})

removeVideoBtn.addEventListener('click', function (event) {
    if (inputSuspended) return
    removeVideo()
})


function togglemute() {
    if (currentVideoData !== null && videoPlayer !== null) {
        if (muted) {
            videoPlayer.muted = false
            muted = false
            muteBtn.classList.remove('mute-icon')
            muteBtn.classList.add('sound-icon')
        } else {
            videoPlayer.muted = true
            muted = true
            muteBtn.classList.add('mute-icon')
            muteBtn.classList.remove('sound-icon')
        }
    }
}




function webGet(url) {
    axios.get(url)
        .then(res => {

        })
}


function gotoRoute() {
    const mPath = path.join('file://', __dirname, '.html')
    let win = new BrowserWindow({ width: 600, height: 500, frame: false, alwaysOnTop: true, transparent: true })
    win.on('close', function () {
        win = null
    })
    win.loadURL(mPath)
    win.show()
}

ipc.on('sign-state', function (event, arg) {
    //do something with value
})



function sendNotification(title, body) {

    const notificationData = {
        title: "Video Trancoder",
        body: "done with transcoding"
    }
    const notification = new window.Notification(title, notificationData)
}

function getFile(path, encoding = "utf8") {
    if (fs.existsSync(path)) {
        return encoding == null ? fs.readFileSync(path) :fs.readFileSync(path, 'utf8')
    }
    else return null

}



function saveFile(path, output) {
    fs.writeFileSync(path, output);
}


//get image from file, initialize preview and save for upload

//used from html
function thumbSelected(input) {

    const name = input.files.item(0).name;
    const size = input.files.item(0).size;
    const type = input.files.item(0).type;
    const path = input.files.item(0).path;

    var reader = new FileReader();

    if (input['files'][0] !== null) {
        reader.readAsDataURL(input['files'][0]);
        reader.onload = function (oFREvent) {
            imagePreviewEl.style.backgroundImage = "url('" + oFREvent.target.result + "')"
            imagePreviewEl.classList.add('slctd')
            imageSelectedState = true
            imageBase64String = oFREvent.target.result.split(',')[1]

        };
        setProgressComplete('thumb', true)

    }


}

//used from html
function videoSelected(input) {
    // alert('video selected')
    if (input.files == null) return
    const name = input.files.item(0).name;
    const size = input.files.item(0).size;
    const type = input.files.item(0).type;
    const path = input.files.item(0).path;


    currentVideoData = registerVideo(path)
    videoSelectedState = true

    playPreview()


}

function setProgressComplete(index, state) {

    progressData[index][1] = state;
    updateProgressUI()
}

function setProgressActive(index, state) {

    progressData[index][2] = state;
    updateProgressUI()
}

function updateProgressUI() {


    for (const [key, element] of Object.entries(progressData)) {
        let i = element[0]
        let done = element[1]
        let active = element[2]



        if (!done) {

            if (i === 0) {
                clearActiveProgress()
                clearCompleteProgress()

            }
            return;
        }

        progressNodes[i].classList.add(completeClass)

        clearActiveProgress()
        progressNodes[i].classList.add(activeClass)

        if (i === 1 || i === 3) {
            actionButton.classList.remove('inactive')
        } else {
            actionButton.classList.add('inactive')
        }

        switch (i) {
            case 3:
                actionButton.innerHTML = 'Start Upload';

                break;

            default:
                actionButton.innerHTML = buttonText;
                break;
        }



    }
}

function clearActiveProgress() {
    for (const [key, element] of Object.entries(progressNodes)) {
        element.classList.remove(activeClass)
    }
}

function clearCompleteProgress() {
    for (const [key, element] of Object.entries(progressNodes)) {
        element.classList.remove(completeClass)
    }
}


function playPreview() {

    if (currentVideoData) {
        // alert('init preview')
        videoPlayer = document.createElement('video');
        videoPlayer.src = currentVideoData.fileDir
        videoPlayer.id = videoPlayerId
        videoPlayer.classList.add("vplyr")
        videoPlayer.muted = true
        videoContainer.insertBefore(videoPlayer, videoContainer.firstChild)
        videoPlayer.play()
        buttonText = 'Transcode Video';
        setProgressComplete('video', true)
        setProgressActive('video', false)


    }
}
function removeVideo() {

    if (videoPlayer !== null) {
        videoContainer.removeChild(videoPlayer);
        videoPlayer = null
        muted = false

        videoSelectedState = false
        videoSelectFormInput.value = null
        setProgressActive('video', false)
        setProgressComplete('video', false)
        setProgressActive('name', false)
        setProgressComplete('name', false)

        transcoded = false
        manifestFiles = []
        pagckaged = false

        deleteResidualFiles()
        currentVideoData = null
    }
}

function deleteResidualFiles() {

}

function getDb(){
    const appPath = ([electron].app || electron.remote.app).getPath('userData');
    const transcodePath = path.join(appPath, 'transcodes') 
    const dbfile = transcodePath + 'trans_reg.json'

    if (!fs.existsSync(transcodePath)) fs.mkdirSync(transcodePath)

    //adding registery to json file
    let reg;
    
    if ((reg = getFile(dbfile)) === null) {
        const defaultJSON = JSON.stringify(default_reg_file)
        saveFile(dbfile, defaultJSON)
        reg = defaultJSON
    }

    reg = JSON.parse(reg)
    return reg
}



function registerVideo(filepath) {

    const appPath = (electron.app || electron.remote.app).getPath('userData');
    const transcodePath = path.join(appPath, 'transcodes') 
    const time = Date.now()
    const videoId = 'vid_' + time
    const transcodeVideoPath = path.join(transcodePath, videoId)
    const dbfile = path.join(transcodePath, 'trans_reg.json')
    if (!fs.existsSync(transcodePath)) fs.mkdirSync(transcodePath)
    if (!fs.existsSync(transcodeVideoPath)) fs.mkdirSync(transcodeVideoPath)
    

    //adding registery to json file
    reg = getDb()

    reg.transcodes[videoId] = {
        videoId: videoId,
        fileDir: filepath,
        transcodeHome: transcodePath,
        transcodePath: transcodeVideoPath,
        transcodeTime: 0,
        transcodeState: 0
    };

    saveFile(dbfile, JSON.stringify(reg));
    //alert(reg.transcodes[videoId])
    return reg.transcodes[videoId];

}

function startTranscodeProcess(params) {

    ffmpeg.ffprobe(currentVideoData.fileDir, (err, metaData) => {
        currentVideoData.duration = Math.ceil(metaData.format.duration)

        console.log(metaData)

        for (let i = 0; i < metaData.streams.length; i++) {
            if(typeof metaData.streams.height !== 'undefined'){
                currentVideoData.height = metaData.streams.height
                currentVideoData.width = metaData.streams.width
                break
            }
            
        }

        transcodeVideo()
    })
}

function transcodeVideo(path) {


    var proc = new ffmpeg()
    console.log(currentVideoData.transcodePath)

    proc.addInput(currentVideoData.fileDir).outputOptions([
        "-preset slow",
        "-keyint_min 100",
        "-g 100",
        "-sc_threshold 0",
        "-r 24",
        "-pix_fmt yuv420p",
        "-map v:0",
        "-s:0 960x540",
        "-b:v:0 800k",
        "-maxrate:0 900k",
        "-bufsize:0 900k",
        "-map v:0",
        "-s:1 416x234",
        "-b:v:1 100k",
        "-maxrate:1 135k",
        "-bufsize:1 135k",
        "-map v:0",
        "-s:2 640x360",
        "-b:v:2 500k",
        "-maxrate:2 520k",
        "-bufsize:2 520k",
        "-map a:0",
        "-map a:0",
        "-map a:0",
        "-c:a aac",
        "-b:a 96k",
        "-ac 1",
        "-ar 44100",
        "-f hls",
        "-hls_time 10",
        "-hls_playlist_type vod",
        "-hls_flags independent_segments",
        "-master_pl_name playback.m3u8",
        "-hls_segment_filename", currentVideoData.transcodePath + "/s_%v_%06d.ts",
        "-strftime_mkdir 1",
        "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2"
    ]).output(currentVideoData.transcodePath + '/stream_%v.m3u8')
        .on('start', function (commandLine) {
            isTranscoding = true
            actionButton.disabled = true

        })
        .on('error', function (err, stdout, stderr) {
            console.log(err)
            console.log(stdout)
            console.log(stderr)
            actionButton.innerHTML = 'Problem with video'
            isTranscoding = false
            actionButton.disabled = false
            isTranscoding = false
            transcoded = false
        })
        .on('progress', function (progress) {
            actionButton.innerHTML = 'Transcoding ' + Math.floor(progress.percent) + '% ...'

        })
        .on('end', function (err, stdout, stderr) {
            buttonText = 'Done transcoding';
            setProgressActive('name', true)
            setProgressComplete('name', true)
            isTranscoding = false
            transcoded = true
            actionButton.disabled = false
            prepareManifestFiles();
        })
        .run()


}

function cleanManifestFiles() {
    const path = currentVideoData.transcodePath;
    const mainManifest = 'playback.m3u8';


    for (let i = 0; i < manifestFiles.length; i++) {
        const fileDir = manifestFiles[i]

        fs.readFile(fileDir, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replaceAll(path + "/", './');

            fs.writeFile(fileDir, result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });

    }



    packageManifestFiles()

}

function prepareManifestFiles() {
    const startPath = currentVideoData.transcodePath
    const filter = '.m3u8'

    if (!fs.existsSync(startPath)) {
        return;
    }
    setTimeout(() => {
        var files = fs.readdirSync(startPath);

        for (var i = 0; i < files.length; i++) {

            var filename = path.join(startPath, files[i]);
            var stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                fromDir(filename, filter); //recurse
            }

            else if (filename.indexOf(filter) >= 0) {

                manifestFiles.push(filename)
            }

        }

        cleanManifestFiles()
    }, 3000);

};

function packageManifestFiles() {
    currentVideoData.package = path.join(currentVideoData.transcodeHome, currentVideoData.videoId + '.zip')
    console.log(currentVideoData.package)
    const output = fs.createWriteStream(currentVideoData.package);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    output.on('close', function () {
        archiveSize = archive.pointer()
        packaged = true

    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        actionButton.disabled = true
        actionButton.innerHTML = "Problem Packaging Video"
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);


    archive.append(imageBase64String, { name: 'thumb.txt' });
    archive.directory(currentVideoData.transcodePath, false);

    //done
    archive.finalize();

}

function uploadProgress(data){
    console.trace()
    console.log('progress data')
    console.log(data);
}


function loginAction(data){
    if(askedToLogin)return;
    askedToLogin = true;
    const loginModalHolder = document.querySelector('#login_hldr');
    const loginModal = loginModalHolder.content;
    
    const cookieBar = (window.cookieBarContext)?window.cookieBarContext : new Cookie1();
    cookieBar.alert("Please Sign in to Continue");

    if(!logininit){
        logininit = true;
        const btn = loginModal.querySelector("[func='login']")
        btn.addEventListener("click", function(){
            dolsbmt();
          });

    }

    setTimeout(function(){ if (loginModal) {
        window.loginModal = loginModal;
        document.body.appendChild(window.loginModal);
    }
 }, 1000);

}

function startUploadProcess() {
    suspendInputs()
    const target = 'http://api.hello.coda/save/video'
    const formData = new FormData()

    let db = getDb()
    
    //let apiKey = window.enc.drm(db.appkpp, db.mixer)
    let apiKey = "hello_api"


    const file = getFile(currentVideoData.package)
    let buffer = Buffer.from(file);
    let arraybuffer = Uint8Array.from(buffer).buffer;
    let blob  = new Blob([new Uint8Array(arraybuffer)]);

    formData.append('title', document.getElementById('rtit').value)
    formData.append('caption', document.getElementById('ctit').value)
    formData.append('duration', currentVideoData.duration)
    formData.append('width', currentVideoData.width)
    formData.append('height', currentVideoData.height)
    formData.append('master', 'playback.m3u8')
    formData.append('thumb', 'thumb.txt')
    formData.append('token', apiKey)
    formData.append('video', blob, 'package.zip')




    const options = {
         callback:processResult,
         progressCallback: uploadProgress
    }

    window.cookieBarContext.progress("Starting Upload...")
    ajax.postRequest(target, formData, options)

}


function processResult(data) {
    let res = data;
    let index = res['i'];
    console.log('the result to process is');
    console.log(res);

    if (res['error'] == 1) {
        if (res['code'] == 999 || res['code'] == 403) {
            loginAction();
        } else {
            if (window.cookieBarContext) window.cookieBarContext.alert('An Unexpected Error Occoured');
        }

    }




}

function suspendInputs(state = true){
    inputSuspended = true
    const inps = document.getElementsByClassName('fhldr_inp');

    for (let i = 0; i < inps.length; i++) {
        inps[i].readOnly = state? 'readonly' : false
    }


}


function fieldChanged(e) {
    const countdisplay = e.parentNode.querySelector('.txt_cntr');
    const currentlength = e.value.length;
    const maxlength = e.maxLength;
    const name = e.name;
    let setValue = e.value;
    if (countdisplay != null) {
        countdisplay.innerHTML = currentlength + '/' + maxlength;
    }

    //adding the value to the submition form
    const field = formElement.querySelector('input[name="' + name + '"]');

    if (name == 'title') {
        if (setValue.length > 4) {
            setProgressActive('complete', true)
            setProgressComplete('complete', true)

        } else {
            setProgressActive('complete', false)
            setProgressComplete('complete', false)

        }
    }

    if (field !== null) {
        if (e.type == 'checkbox') {
            field.value = (e.checked) ? 1 : 0;
        } else {
            field.value = setValue;
        }
    }
}

function dolsbmt() {
    if (loginRequestActive){
        return;
    }else{
        loginRequestActive = true;
    }
    let error = 0;


    const ps = document.querySelector("#lg_pass").value;
    const pu = document.querySelector("#lg_usr").value;
    const fn = document.querySelector("#lg_usr_fn").value;
    const ln = document.querySelector("#lg_usr_ln").value;
    const cn = document.querySelector("#lg_usr_cnt").value;

    const ps_mst = document.querySelector("#pass_msg");
    const pu_msg = document.querySelector("#usr_msg");

    if (pu.length < 3){
        window.cookieBarContext.alert('Please Enter a valid username');

        error++;
    } 

    if(ps.length < 3){
        //trigger no error on password
        
        //window.cookieBarContext.alert('Please Enter a Valid Password');
        //error++;
    }

    if (pu && ps && error === 0) {

        window.cookieBarContext.progress('Signing you in...');

        const apiKey = 'hello_api'
        const formdata = new FormData();
        formdata.append('username', pu);
        formdata.append('password', ps);
        formdata.append('token', apiKey)

        const options = {
            callback: checkLoginSuccessful
        }

        const target = 'http://api.hello.coda/login/auth.php'

        ajax.postRequest(target, formdata, options);
    } else {
        
        loginRequestActive = false;
        return;

    }
}

function checkLoginSuccessful(data){
    let db = getDB()
    if (typeof(data) == 'object') {
        if (data['error'] == '0') {
            //this loop finds the device id in the result actions list
            for (let i = 0; i < data['actions'].length; i++) {
                if (data['actions'][i]['mark'] == 'device_id') {
                    const ivalue = data['actions'][i]['data'];


                    const cookie = { url: 'http://api.hello.coda', name: 'id_value', value: ivalue, expirationDate: getTime() + 31556952}
                    session.defaultSession.cookies.set(cookie)
                    .then(() => {
                        // success
                    }, (error) => {
                        console.error(error)
                    })
                    

                }else if (data['actions'][i]['mark'] == 'session_id') {
                    const sesid = data['actions'][i]['data'];
                    window.cookieContext.set('PHPSESSID', sesid);

                    const cookie = { url: 'http://api.hello.coda', name: 'PHPSESSID', value: sesid, expirationDate: getTime() + 31556952}
                    session.defaultSession.cookies.set(cookie)
                    .then(() => {
                        // success
                    }, (error) => {
                        console.error(error)
                    })
                }
                
            }
            //end

            //perform action
            //init page
            removeLoginModal();

            if (transcoded && progressData.complete[1] && packaged) {
                startUploadProcess();
            }


            

        } else if (data['error'] == '1') {
            window.cookieBarContext.remove();
            setTimeout(function(){
                  window.cookieBarContext.alert(data['error_msg']);  
                
            }, 500);


        }
    } else {
       console.log('data');
        requestuserid('an unexpected Error occoured');
    }
}

function removeLoginModal(){
    if(!window.loginModal) return;


    //temporary solution remove
    const ele = document.querySelector("#fta-lgn-ele");
    ele.parentNode.removeChild(ele);
    return;

    //end

    const loginModalHolder = document.querySelector('#login_hldr');

    loginModalHolder.appendChild(window.loginModal);
    

    delete window.loginModal;
}
