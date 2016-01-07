
document.addEventListener("DOMContentLoaded", function(event) { 
  main();
});

var loadedElements = 0;

function main() {
    //get canvas to draw the tiles and cleared
    var canvas = document.getElementById('canvas');
    

    var imgLoader = function imgLoader(data, x, y) {
        drawSvgInCanvas(data, canvas,x,y);
    }

    document.getElementById("files").onchange = function () {
        loadedElements = 0;
        var reader = new FileReader();

        reader.onload = function (e) {
            var img = document.getElementById("image");
            
            img.onload = function() {

                
                    var context = getImageContext(img);

                    canvas.width = context.canvas.width;
                    canvas.height = context.canvas.height;

                    tilesContext = canvas.getContext && canvas.getContext('2d');
                    tilesContext.clearRect(0, 0, canvas.width, canvas.height);
                    
                    //break each tile of the image and replaced with the response.
                    var posx, posy;
                    posx = posy = 0;
                    y =0;


                    var rowManagerIndex = 0;
                    var rowBlock = false;
                    var finish = false;
                    var y,numRows = 0;
                    var rowTiles = 0;

                    (function generateRow(){
                        
                        if(!rowBlock) {
                            rowTiles =0;
                            
                            for(var x = 0; x < context.canvas.width - TILE_WIDTH; x+=TILE_WIDTH) {
                                    var rgb = getAverageRGBByContextSection(context, x,y,TILE_WIDTH,TILE_HEIGHT);
                                    getColorTileSvg(rgb, imgLoader,posx,posy);
                                    posx+=16;
                                    rowTiles++;
                            };    
                            rowBlock = true;
                        }
                        
                        if(!finish) {
                            if(loadedElements === rowTiles) {
                                rowBlock =false;
                                loadedElements=0;

                                posy += 16;
                                posx=0;
                                y+=TILE_HEIGHT;
                                numRows++;

                            } else if(y > context.canvas.height - TILE_HEIGHT) {
                                finish = true;
                                return;
                            }

                            window.requestAnimationFrame(generateRow);
                        }
                    })();
            }
            img.src = e.target.result;
        };

        // read the image file as a data URL.
        reader.readAsDataURL(this.files[0]);
    };
}

function getImageContext(imgEl) {
    var canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        width, height;
        
    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    return context;
}

function getAverageRGBByContextSection (context,x,y,width, height) {
      var rgb = {r:102,g:102,b:102}, // Set a base colour as a fallback for non-compliant browsers
      pixelInterval = 5 , // Rather than inspect every single pixel in the image inspect every 5th pixel
      count = 0,
      i = -4,
      data, length;

  // return the base colour for non-compliant browsers
  if (!context) { return rgb; }

  try {
    data = context.getImageData(x, y, width, height);
  } catch(e) {
    // catch errors - usually due to cross domain security issues
    alert(e);
    return rgb;
  }

  data = data.data;
  length = data.length;
  while ((i += pixelInterval * 4) < length) {
    count++;
    rgb.r += data[i];
    rgb.g += data[i+1];
    rgb.b += data[i+2];
  }
  
  // floor the average values to give correct rgb values (ie: round number values)
  rgb.r = Math.floor(rgb.r/count);
  rgb.g = Math.floor(rgb.g/count);
  rgb.b = Math.floor(rgb.b/count);

  return rgb;
}


function rgbToHexString(rgb) {
    return ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

function getColorTileSvg(rgb, imgLoader,x,y) {
    var hex = rgbToHexString(rgb);
    var src =  ["/color/",hex].join('');

    var oReq = new XMLHttpRequest();
    
    try{
        oReq.addEventListener("load", function(){imgLoader(this.responseText,x,y)});
        oReq.open("GET", src);
        oReq.onerror = function(){console.log("error" + oReq.status)}  
        oReq.upload.onerror = function(){console.log("error" + oReq.status)}
        oReq.send();
    }catch(e){
        console.log("error", e);
    }
    
}


function drawSvgInCanvas(data,canvas, posx, posy) {
    var ctx = canvas.getContext('2d');
    //console.log("data,canvas, posx, posy",data,canvas, posx, posy)
    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svg);

    img.onload = function () {
      ctx.drawImage(img, posx, posy);
      DOMURL.revokeObjectURL(url);
      loadedElements++;
    }

    img.src = url;
}

