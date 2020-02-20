//****************************************
//PILE RESEARCH
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2020-02-17	Start

//****************************************
//Todo

//****************************************
//Dependencies

//****************************************
var canvasControl;
var qcDataFileName="qc01.txt";


function bodyLoaded(e)
{
	canvasControl=document.getElementById("paint_area");
	//smartizeCanvas(canvasControl);
	//Loading the test data
	var request = new XMLHttpRequest();
	request.open("GET", qcDataFileName, false);
	request.overrideMimeType("text/plain")
	request.send("");
	var lines=request.responseText.split("\n");
	var qcs=[];
	var last_y=-0.02;
	for(var i=2; i<lines.length; i++)
	{
		//console.log(lines[i]);
		if(lines[i].length>0)
		{
			var s=lines[i].trim().split("\t");
			if(s.length==2)
			{
				var y=parseFloat(s[0].replace(",", "."));
				var qc=parseFloat(s[1].replace(",", "."));
				console.log(y.toFixed(2) + "\t" + qc.toFixed(2));
				if(Math.abs(y-last_y-0.02)<=0.001)
				{
					qcs.push(qc);
					last_y=y;
				}
				else
				{
					throw "Wrong y value in line "+(i+1);
				}
			}
			else
			{
				throw "Incomplete line "+(i+1);
			}
		}
	}
	
	//maximal qc value
	var max_qc=0;
	for(var i=0; i<qcs.length; i++)
	{
		if(qcs[i]>max_qc)
		{
			max_qc=qcs[i];
		}
	}
	var hScale=400/max_qc;
	//var vScale=c.canvas.height/qcs.length;
	var vScale=0.2;
	var c=canvasControl.getContext('2d');
	c.fillStyle = "white";
	c.fillRect(0, 0, c.canvas.width, c.canvas.height);
	c.strokeStyle = "red";
	c.beginPath();
	c.moveTo(qcs[0]*hScale, 0*vScale);
	for(var i=1; i<qcs.length; i++)
	{
		c.lineTo(qcs[i]*hScale, i*vScale);
	}
	c.stroke();
	//alert(request.responseText);
};



function renderDrawing()
{
	var c=canvasControl.getContext('2d');
	c.setTransform(1, 0, 0, 1, 0, 0);
	c.fillStyle = "white";
	c.fillRect(0, 0, c.canvas.width, c.canvas.height);
	if(drawingDFXDoc!=null)
	{
		drawingDFXDoc.render(c, canvasControl.actualView);
	}
	
	//minta találatok
	c.strokeStyle = "red";
	c.fillStyle="red";
	for(var i=0; i<matches.length; i++)
	{
		var t=matches[i];
		c.beginPath();
		c.arc(t.x, t.y, 30, 0, 2*Math.PI, true);
		c.closePath();
		c.fill();
		c.stroke();
	}
	
	//középvonalak
	c.strokeStyle="yellow";
	c.fillStyle="none";
	//c.lineWidth=2/canvasControl.scale;
	c.lineWidth=5;
	for(var i=0; i<axes.length; i++)
	{
		var s=axes[i];
		c.beginPath();
		c.moveTo(s.p0.x, s.p0.y);
		c.lineTo(s.p1.x, s.p1.y);
		c.closePath();
		c.stroke();
	}

}


//****************************
// Attaches mouse actions to canvas
//****************************

function smartizeCanvas(c)
{
	c.actualView=new ViewProperties();
	c.panStarted=false;
	c.addEventListener("wheel", function(e)
	{
		//A korzor koordinátái a canvason képpontban mérve. Csak akkor működik jól, ha nincs az egész lap bezúmolva
		var localScreenX=e.x-e.target.offsetLeft-e.target.clientLeft;
		var localScreenY=e.y-e.target.offsetTop-e.target.clientTop;
		var rescaleFactor=(1-e.deltaY/3*0.25);
		//A zúmolás után a kurzor ugyan arra pontra mutasson, mint előtte
		e.target.actualView.scale*=rescaleFactor;
		e.target.actualView.x=localScreenX-rescaleFactor*(localScreenX-e.target.actualView.x);
		e.target.actualView.y=localScreenY-rescaleFactor*(localScreenY-e.target.actualView.y);
		renderDrawing();
	});
	c.addEventListener("mousedown", function(e)
	{
		event.target.mouseDownX=e.x;
		event.target.mouseDownY=e.y;
		e.target.panStarted=true;
	});
	c.addEventListener("mouseup", function(e)
	{
		var mouseDeltaX=e.x-event.target.mouseDownX;
		var mouseDeltaY=e.y-event.target.mouseDownY;
		event.target.actualView.pan(mouseDeltaX, mouseDeltaY);
		e.target.panStarted=false;
		renderDrawing();
	});
	c.addEventListener("mousemove", function(e)
	{
		if(e.target.panStarted)
		{
			var mouseDeltaX=e.x-event.target.mouseDownX;
			var mouseDeltaY=e.y-event.target.mouseDownY;
			event.target.mouseDownX=e.x;
			event.target.mouseDownY=e.y;
			event.target.actualView.pan(mouseDeltaX, mouseDeltaY);
			renderDrawing();
		}
	});
	c.addEventListener("mouseout", function(e)
	{
		e.target.panStarted=false;
	});
}






//Ez határozza meg hogy hova rajzolódjon az ábra a vásznon
function ViewProperties()
{
	this.x=0;
	this.y=0;
	this.scale=1;
	this.centerDrawingOnCanvas=function(drawing, canvas)
	{
		var b=drawing.getBoundingBox();
		var scaleGuessH=canvas.width/b.getWidth();
		var scaleGuessV=canvas.height/b.getHeight();
		this.scale=scaleGuessH<scaleGuessV?scaleGuessH:scaleGuessV;
		this.x=canvas.width/2.0-this.scale*b.getWidth()/2.0-this.scale*b.p0.x;
		this.y=canvas.height/2.0+this.scale*b.getHeight()/2.0+this.scale*b.p0.y;
	};
	this.pan=function(dx, dy)
	{
		this.x+=dx;
		this.y+=dy;
	};
	return this;
};

