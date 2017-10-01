"use strict";

function addClass(video,styleClass) {
    var totalVideosOnPage = video.length;
    var videoClassList = [];

    for(var i=0; i < totalVideosOnPage; i++) {
        videoClassList = video[i].classList;
        videoClassList.add(styleClass);
        console.log("[UltraWide] addClass",styleClass,video[i]);
    }
}
function remClass(video,styleClass) {
    var totalVideosOnPage = video.length;
    var videoClassList = [];

    for(var i=0; i < totalVideosOnPage; i++) {
        videoClassList = video[i].classList; 
        if(videoClassList.contains(styleClass)) {
            videoClassList.remove(styleClass); 
            console.log("[UltraWide] remClass",styleClass,video[i]);
        }
    }
}

UltraWide.prototype.update = function() {
    //Calculate scale factor:
    const aspect = screen.width / screen.height;
    if(aspect >= 1.88) { //If wider than 16:9 widescreen:
        const scale = aspect / 1.77; this.scale = Math.round(scale*100)/100;
    } else if(this.mode == 3 || this.mode == 4) this.scale = 1.33; //Force Modes
    else this.scale = 1; //Default

    //Update Styles:
    this.styles.innerHTML = ".extraClassAspect { -webkit-transform:scaleX("+this.scale+")!important; }"
        +".extraClassCrop { -webkit-transform:scale("+this.scale+")!important; }";

    //Update Classes:
    let fullscreen;

    if(document.webkitCurrentFullScreenElement !== null) {
        fullscreen = true;
    }else{
        fullscreen = false;
    }

    const video = document.getElementsByTagName('video');
    console.log(video);
    console.log("[UltraWide] Page Update", this.mode, this.scale, fullscreen);

    if(video.length !== 0) {
        switch(this.mode) {
            case 0: //Disabled
                remClass(video,'extraClassAspect');
                remClass(video,'extraClassCrop');
                break; 
            case 1: //Aspect
                if(fullscreen && this.scale > 1) {
                    addClass(video,'extraClassAspect');
                    remClass(video,'extraClassCrop');
                } else {
                    remClass(video,'extraClassAspect');
                    remClass(video,'extraClassCrop');
                }
                break; 
            case 2: //Crop
                if(fullscreen && this.scale > 1) {
                    addClass(video,'extraClassCrop');
                    remClass(video,'extraClassAspect');
                } else {
                    remClass(video,'extraClassAspect');
                    remClass(video,'extraClassCrop');
                }
                break; 
            case 3: //Force Crop
                addClass(video,'extraClassCrop');
                remClass(video,'extraClassAspect');
                break; 
            case 4: //Force Aspect
                addClass(video,'extraClassAspect');
                remClass(video,'extraClassCrop');
                break;
        }
    } 

    //Update every 12s in fullscreen mode:
    if(fullscreen && this.mode > 0 && video.length > 0) {
        if(this.timer != null) {
            clearTimeout(this.timer);    
        } 
        this.timer = setTimeout(function() {
            this.update();
            this.timer = null;
        }.bind(this), 5000);
    }
}

function UltraWide() {
    this.mode = 0;
    document.addEventListener('webkitfullscreenchange', function() {
        this.update();
    }.bind(this));

    document.addEventListener('keydown', function(hotKeyPressed) {
        if(hotKeyPressed.ctrlKey && hotKeyPressed.altKey && hotKeyPressed.key == 'c') {
            if(++this.mode > 2) this.mode = 0;
            console.log("[UltraWide] Detected CTRL+ALT+C","Mode "+this.mode);
            chrome.storage.local.set({'extensionMode':this.mode}, function(){});
        }
    }.bind(this));

    this.styles = document.createElement('style');
    document.body.appendChild(this.styles);
}

function onLoad() {
    if(!document.body) return;
    const ultrawide = new UltraWide();
    chrome.storage.local.get('extensionMode', function(status) {
        ultrawide.mode = status.extensionMode;
        if(status.extensionMode != 0) ultrawide.update();
    });
    chrome.storage.onChanged.addListener(function(changes) {
        ultrawide.mode = changes.extensionMode.newValue;
        ultrawide.update();
    });
    console.info("UltraWide Extension Loaded!");
}

if(document.readyState == 'complete') onLoad();
else window.addEventListener('load', onLoad);