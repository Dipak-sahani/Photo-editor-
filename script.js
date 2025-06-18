$(document).ready(function () {
    let canvas = document.getElementById("imageCanvas");
    let ctx = canvas.getContext("2d");
    let images = [];
    let stickers = [];
    let texts = [];
    let historyStack = []; // Store previous states
    let redoStack = []; // (Optional) If you want Redo
    let operations=[];
    let shapes = []; // Store drawn shapes
    let selectedTxt=0;
    canvas.width = 500;
    canvas.height = 500;
    let draggingShape = null;
    let resizingShape = null;
    let offsetX, offsetY;
    let resizeCornerSize =0;
    let selectedShapeIndex=0;

    function redrawCanvas() {
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    images.forEach(img => drawImageWithFilter(img));
    stickers.forEach(sticker => drawSticker(sticker));
    texts.forEach(text => drawText(text));
    shapes.forEach(shape=>drawShape(shape));
    //drawShapes();
    }

    function drawImageWithFilter(img) {
        ctx.save(); // Save the current state
        ctx.globalAlpha = img.alpha; // Apply individual alpha
        ctx.filter = `brightness(${img.brightness}%) contrast(${img.contrast}%) grayscale(${img.grayscale}%)`;
        ctx.drawImage(img.img, img.x, img.y, img.width, img.height);
        ctx.restore(); // Restore previous state to prevent affecting other elements
    }
    
    function saveState() {
        historyStack.push(canvas.toDataURL()); // Save current canvas as an image
        if (historyStack.length > 20) historyStack.shift(); // Limit history size
    }
    function undo() {
        if (historyStack.length > 0) {
            let lastState = historyStack.pop();
            
            let img = new Image();
            img.src = lastState;
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    }
    function resetCanvas() {
        historyStack = []; // Clear history
        images = [];
        stickers = [];
        texts = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    }
    function drawSticker(sticker) {
        ctx.drawImage(sticker.img, sticker.x, sticker.y, sticker.width, sticker.height);
    }

    function drawText(text) {
        
        ctx.font = `${text.size}px ${text.font}`;
        ctx.fillStyle = text.color;
        ctx.fillText(text.text, text.x, text.y);
    }


    function drawShape(shape){
        ctx.save();
        ctx.globalAlpha = shape.alpha; // Set transparency
        ctx.fillStyle = shape.color;
        if (shape.type === "rectangle") {
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            ctx.strokeRect(shape.x + shape.size - resizeCornerSize, shape.y + shape.size - resizeCornerSize, resizeCornerSize, resizeCornerSize);
        }else if (shape.type === "circle") {
                        ctx.beginPath();
                        ctx.arc(shape.x, shape.y, shape.size / 2, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.strokeRect(shape.x + shape.size / 2 - resizeCornerSize, shape.y + shape.size / 2 - resizeCornerSize, resizeCornerSize, resizeCornerSize);
                    }

    ctx.restore();
    }

    // function drawShapes() {
    //     //ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     shapes.forEach((shape) => {
    //         ctx.globalAlpha = shape.alpha; // Set transparency
    //         ctx.fillStyle = shape.color;
            
    //         if (shape.type === "rectangle") {
    //             ctx.fillRect(shape.x, shape.y, shape.size, shape.size);
    //             ctx.strokeRect(shape.x + shape.size - resizeCornerSize, shape.y + shape.size - resizeCornerSize, resizeCornerSize, resizeCornerSize);
    //         } else if (shape.type === "circle") {
    //             ctx.beginPath();
    //             ctx.arc(shape.x, shape.y, shape.size / 2, 0, 2 * Math.PI);
    //             ctx.fill();
    //             ctx.strokeRect(shape.x + shape.size / 2 - resizeCornerSize, shape.y + shape.size / 2 - resizeCornerSize, resizeCornerSize, resizeCornerSize);
    //         } else if (shape.type === "triangle") {
    //             ctx.beginPath();
    //             ctx.moveTo(shape.x, shape.y);
    //             ctx.lineTo(shape.x + shape.size, shape.y);
    //             ctx.lineTo(shape.x + shape.size / 2, shape.y - shape.size);
    //             ctx.closePath();
    //             ctx.fill();
    //             ctx.stroke();
    //         }
    //     });
    // }

    function getShapeAtPosition(x, y) {
        // console.log(x);
        // console.log(y);
        // console.log(shapes);
              

        for (let i = shapes.length - 1; i >= 0; i--) {
            let shape = shapes[i];
            
            
            // if (
            //     shape.type === "rectangle" &&
            //     x >= shape.x + shape.width - resizeCornerSize &&
            //     x <= shape.x + shape.width &&
            //     y >= shape.y + shape.height - resizeCornerSize &&
            //     y <= shape.y + shape.height
            // ) {
            //     return { shape, isResizing: true,"index":i };
            // } else if (
            //     shape.type === "circle" &&
            //     Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2) <= shape.size / 2 + resizeCornerSize
            // ) {
            //     return { shape, isResizing: false,"index":i };
            // }

            if (
                shape.type === "rectangle" &&
                x >= shape.x &&
                x <= parseInt(shape.x) +parseInt(shape.width)  &&
                y >= shape.y &&
                y <= parseInt(shape.y) + parseInt(shape.height )  
            ) {
                
                return { shape, isResizing: false,"index":i };
            } else if (
                shape.type === "circle" &&
                Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2) <= shape.size / 2
            ) {
                return { shape, isResizing: false,"index":i };
            }
        }
        return null;
    }

    $("#uploadImage").change(function (event) {
        let file = event.target.files[0];
        let img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = function () {
            images.push({ img, x: 50, y: 50, width: 400, height: 400, brightness: 100, contrast: 100, grayscale: 0 });
            saveState();
            operations.push({"operation":"image"}) 
            
            
            redrawCanvas();
        };


        
    $("#upload").click(function(){
       // console.log("hi");
        
        images.push({ img, x: 50, y: 50, width: 400, height: 400, brightness: 100, contrast: 100, grayscale: 0 });
            saveState();
            operations.push({"operation":"image"}) 
            
            
            redrawCanvas();
    })

    });

    $("#uploadSticker").change(function (event) {
        let file = event.target.files[0];
        let img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = function () {
            stickers.push({ img, x: 100, y: 100, width: 100, height: 100 });
            saveState();
            operations.push({"operation":"sticker"}) 
            redrawCanvas();
        };
        
    });

    $("#opacity").on("input", function () {
        if (images.length > 0) {
            images[images.length - 1].alpha = this.value;
            redrawCanvas();
        }
    });
    

    $("#undo").click(function () {
        undo();
        // console.log(operations[operations.length-1].operation);
        let undoOperation=operations[operations.length-1].operation
        if(undoOperation==="image"){
            images.pop();
            operations.pop();
            
            
        }
        else if(undoOperation ==="text"){
            texts.pop();
            //console.log(texts);
            operations.pop()
            
        }
        else if(undoOperation==="sticker"){
            stickers.pop()
            operations.pop()
        }
        else if(undoOperation==="shape"){
            shapes.pop();
            operations.pop();
        }
       //console.log(operations)
        
        
    });


    $("#reset").click(function () {
        resetCanvas();
    });

    $("#addText").click(function () {
        let txt=prompt("Enter Text");
        let newText = { text: txt, x:canvas.width/2, y:canvas.height/2, size: 20, color: "#000", font: "Arial" };
        texts.push(newText);
        saveState();
        operations.push({"operation":"text"}) 
        redrawCanvas();
        
    });

    $("#brightness, #contrast, #grayscale").on("input", function () {
        if (images.length > 0) {
            images[images.length - 1][this.id] = this.value;
            saveState(); 
            redrawCanvas();
        }
    });

    $("#imageOpacity").on("input", function () {
        if (images.length > 0) {
            images[images.length - 1].alpha = parseFloat(this.value);
            redrawCanvas();
        }
    });
    
    $("#fontSize, #textColor, #fontFamily").on("input change", function () {
        if (texts.length > 0) {
            //let lastText = texts[texts.length - 1];
            let lastText = texts[selectedTxt];
            lastText.size = $("#fontSize").val();
            lastText.color = $("#textColor").val();
            lastText.font = $("#fontFamily").val();
            redrawCanvas();
        }
    });

    $("#canvasColor").change(function(){
        let canvasColor=document.getElementById("canvasColor").value
        //console.log(canvasColor);
        canvas.style.backgroundColor=canvasColor;
        saveState()
        redrawCanvas();
    })

    
    // Function to add a shape with user-defined opacity
    $("#addRectangle").on("click", function () {
        shapes.push({ type: "rectangle", x: 50, y: 50, width: 100,height: 100, color: "#0000FF", alpha: 1 });
        //drawShapes();
        saveState();
        operations.push({"operation":"shape"}) 

        redrawCanvas();
    });

    $("#addCircle").on("click", function () {
        shapes.push({ type: "circle", x: 150, y: 150, size: 100, color: "#FF0000", alpha: 1 });
        //drawShapes();
        saveState();
        operations.push({"operation":"shape"}) 
 

        redrawCanvas();
    });

    $("#addTriangle").on("click", function () {
        shapes.push({ type: "triangle", x: 200, y: 200, size: 100, color: "green", alpha: 1 });
        //drawShapes();
        redrawCanvas();
    });

    $("#clearCanvas").on("click", function () {
        shapes = [];
        //drawShapes();
        redrawCanvas();
    });

    
    // Update opacity of the last added shape dynamically
    $("#shapeOpacity").on("input", function () {
        if (shapes.length > 0) {
            shapes[shapes.length - 1].alpha = parseFloat(this.value);
            redrawCanvas();
        }
    });
    
    $(".canvas-container").on("mousedown", function (e) {
        let offsetX = e.offsetX;
        let offsetY = e.offsetY;
        //console.log(texts);
        
        let selectedText = texts.find(text => offsetX >= text.x && offsetX <= text.x + 100 && offsetY >= text.y - 20 && offsetY <= text.y);
        let selectedSticker = stickers.find(sticker => offsetX >= sticker.x && offsetX <= sticker.x + sticker.width && offsetY >= sticker.y && offsetY <= sticker.y + sticker.height);

        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;
        let result = getShapeAtPosition(mouseX, mouseY);
        
        // console.log(result);
        //console.log(shapes);
        
        if (result) {
            selectedShapeIndex=result.index

            //console.log(result.shape.color);
            
            $("#modify-shape").empty();
            let node1=$("<h2></h2>").text("Change Shape Properties ")
            let node2=$("<lable/>").text("Color :")
            let node3=$("<input/>").attr({type:"color", id:"shape-color",value:result.shape.color})
            let node4=$("<lable/>").text("Alpha")
            let node5=$("<input/>").attr({type:"range",id:"shape-alpha",min:0,max:100,value:result.shape.alpha*100})
            $("#modify-shape").append(node1)
            $("#modify-shape").append(node2)
            $("#modify-shape").append(node3)
            $("#modify-shape").append(node4)
            $("#modify-shape").append(node5)
            if(result.shape.type==="rectangle"){
                $("#modify-shape").append("<lable>Width: </lable>")
                $("#modify-shape").append(`<input id='rect-width' value=${result.shape.width}>`)
                $("#modify-shape").append(`<input id='rect-height' value=${result.shape.height}>`)


            }
            
            

            if (result.isResizing) {
                resizingShape = result.shape;
            } else {
                draggingShape = result.shape;
                offsetX = mouseX - draggingShape.x;
                offsetY = mouseY - draggingShape.y;
            }
        }
        
        

        if (selectedText) {

            texts.find((e,index)=>{
                //console.log(e.x);
                if(selectedText.x===e.x){
                    //console.log(index);
                    selectedTxt=index;
                    //console.log(e.text);
                    $(".toolbar #selectedTxt").remove()
                    $("#font-size-lable").before(`<input type="text" id="selectedTxt" value=${e.text} />`)
                    $("#textColor").val(e.color)
                }
            })



            $(document).on("mousemove", function (e) {
                selectedText.x = e.offsetX;
                selectedText.y = e.offsetY;
                
                
                redrawCanvas();
            });
        }

        if (selectedSticker) {
            $(document).on("mousemove", function (e) {
                selectedSticker.x = e.offsetX - selectedSticker.width / 2;
                selectedSticker.y = e.offsetY - selectedSticker.height / 2;
                redrawCanvas();
            });
        }
        if(draggingShape){
            $(document).on("mousemove", function (event) {
                if (draggingShape) {
                    let rect = canvas.getBoundingClientRect();
                    draggingShape.x = event.clientX - rect.left - offsetX;
                    draggingShape.y = event.clientY - rect.top - offsetY;
                    //drawShapes();
                    redrawCanvas();
                } else if (resizingShape) {
                    let rect = canvas.getBoundingClientRect();
                    let mouseX = event.clientX - rect.left;
                    let newSize = Math.max(10, mouseX - resizingShape.x);
                    resizingShape.size = newSize;
                    //drawShapes();
                    redrawCanvas();
                }
            });
        
        }

        $(document).on("mouseup", function () {
            $(document).off("mousemove");
            draggingShape = null;
            resizingShape = null;
        });
    });

    $(".toolbar").change(function(){
        let textChange=$("#selectedTxt").val();
        //console.log(textChange);
        
        if(textChange){
            texts[selectedTxt].text=textChange;

            redrawCanvas()
        }
    })


    $("#modify-shape").change(function(){
        let val=$("#shape-color").val()
        

        let shape_alpha=$("#shape-alpha").val()
        //console.log(val);
        
        shapes[selectedShapeIndex].color=val
        shapes[selectedShapeIndex].alpha=shape_alpha/100
        
        
        if(shapes[selectedShapeIndex].type==="rectangle"){
            
            let shape_width=$("#rect-width").val()
            let shape_height=$("#rect-height").val()

            shapes[selectedShapeIndex].width=shape_width;
            shapes[selectedShapeIndex].height=shape_height;
            redrawCanvas();
        }
        redrawCanvas();
        

    })

    // $(".canvas-container").on("mousemove", function (event) {
    //     if (draggingShape) {
    //         let rect = canvas.getBoundingClientRect();
    //         draggingShape.x = event.clientX - rect.left - offsetX;
    //         draggingShape.y = event.clientY - rect.top - offsetY;
    //         drawShapes();
    //     } else if (resizingShape) {
    //         let rect = canvas.getBoundingClientRect();
    //         let mouseX = event.clientX - rect.left;
    //         let newSize = Math.max(10, mouseX - resizingShape.x);
    //         resizingShape.size = newSize;
    //         drawShapes();
    //     }
    // });

    // $(".canvas-container").on("mouseup", function () {
    //     draggingShape = null;
    //     resizingShape = null;
    // });

    $("#download").click(function () {
        let link = document.createElement("a");
        link.download = "edited-image.png";
        link.href = canvas.toDataURL();
        link.click();
    });
});
