
document.addEventListener("DOMContentLoaded", function(event) { 
  main();
});

var loadedElements = 0;

function main() {
    //get canvas to draw the tiles and cleared
    var canvas = document.getElementById('canvas');

    document.getElementById("files").onchange = function () {
        loadedElements = 0;
        var reader = new FileReader();

        reader.onload = function (e) {
            var img = document.getElementById("image");
            
            img.onload = function() {

                
                    var context = getImageContext(img);
                    var ballSeparation = 20;

                    canvas.width = context.canvas.width/TILE_WIDTH*ballSeparation;
                    canvas.height = context.canvas.height/TILE_HEIGHT*ballSeparation;
                    image.width = canvas.width;
                    image.height = canvas.height;


                    tilesContext = canvas.getContext && canvas.getContext('2d');
                    tilesContext.clearRect(0, 0, canvas.width, canvas.height);
                    ctx = tilesContext;
                    //break each tile of the image and replaced with the response.
                    var posx, posy;
                    posx = posy = 0;
                    y =0;


                    var rowManagerIndex = 0;
                    var rowBlock = false;
                    var finish = false;
                    var y = 0,numRows = 0;
                    var rowTiles = [];


                    (function generateRow(){
                        
                        
                        if(!rowBlock) {
                            rowTiles = [];
                            
                            for(var x = 0; x < context.canvas.width; x+=TILE_WIDTH) {
                                    var rgb = getAverageRGBByContextSection(context, x,y,TILE_WIDTH,TILE_HEIGHT);
                                    var ball = {
                                      rgb: rgb,
                                      posx:posx,
                                      posy:posy
                                    };
                                    rowTiles.push(ball);

                                    //getColorTileSvg(rgb, ball, posx, posy);
                                    
                                    drawCircleInCanvas( tilesContext, "#"+rgbToHexString(rgb), ball.posx, ball.posy, ballSeparation );

                                    posx+=ballSeparation;
                            };    
                            rowBlock = true;
                            //
                            loadedElements = rowTiles.length;
                        }
                        console.log("y",y)
                        if(!finish) {
                            if(loadedElements === rowTiles.length) {
                                rowBlock =false;
                                loadedElements=0;

                                posy += ballSeparation;
                                posx=0;
                                y+=TILE_HEIGHT;
                                numRows++;

                                //draw row
                                rowTiles.forEach(function(ball){
                                  if(ball.img){
                                    tilesContext.drawImage(ball.img, ball.posx, ball.posy);  
                                  }
                                });
                            }

                            if(y > context.canvas.height) {
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
      pixelInterval = 2 , // Rather than inspect every single pixel in the image inspect every 5th pixel
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

function getColorTileSvg(rgb, ball,x,y) {
    var hex = rgbToHexString(rgb);
    var src =  ["/color/",hex].join('');
    drawSvgInCanvas(src, canvas,x,y, ball);
}

var ctx;
var cachedImages = {};

function drawSvgInCanvas(src,canvas, posx, posy,ball) {
    if(!ctx){
        ctx = canvas.getContext('2d');    
    }
    console.log(posx, posy)
    if(cachedImages[src]){
      //ctx.drawImage(cachedImages[src], posx, posy);
      ball.img = cachedImages[src];
      loadedElements++;
    } else{
      var img = new Image();
    
      img.onload = function () {
        //ctx.drawImage(img, posx, posy);
        cachedImages[src]  = img;
        ball.img = img;
        loadedElements++;
      }

      img.src = src;
    }
}


function drawCircleInCanvas(ctx, color, posx, posy, sep) {
  var radius = sep /2;
  ctx.beginPath();
  ctx.arc(posx+radius, posy + radius, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
}

