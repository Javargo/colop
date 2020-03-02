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
var qcs;
var dy=0.02;


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
	qcs=[];
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
				//console.log(y.toFixed(2) + "\t" + qc.toFixed(2));
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
	renderDrawing();
};


var soilCathegories=
[
	//1
	{
		points: [[0, 0], [52, 6], [50, 15], [46, 26], [39, 40], [31, 52], [25, 57], [15, 62], [0, 66], [0, 0]],
		color: "#ff8041",
		description_hu: "Érzékeny, finom szemcsés talaj"
	},
	//2
	{
		points: [[0, 0], [200, 0], [200, 64], [80, 10], [52, 6]],
		color: "#dbac64",
		description_hu: "Szerves talaj, tőzeg"
	},
	//3
	{
		points: [[52, 6], [80, 10], [200, 64], [200, 119], [103, 119], [101, 113], [87, 87], [71, 66], [61, 56], [50, 47], [39, 40], [46, 26], [50, 15]],
		color: "#fec1ff",
		description_hu: "Agyag"
	},
	//4
	{
		points: [[39, 40], [50, 47], [61, 56], [71, 66], [87, 87], [101, 113], [103, 119], [98, 119], [93, 124], [88, 113], [80, 99], [71, 87], [54, 68], [44, 59], [31, 52]],
		color: "#808080",
		description_hu: "Iszapos agyag - agyag"
	},
	//5
	{
		points: [[31, 52], [44, 59], [54, 68], [71, 87], [80, 99], [88, 113], [93, 124], [79, 139], [75, 128], [62, 106], [47, 87], [23, 67], [15, 62], [25, 57]],
		color: "#acacac",
		description_hu: "Agyagos iszap - iszapos agyag"
	},
	//6
	{
		points: [[15, 62], [23, 67], [47, 87], [62, 106], [75, 128], [79, 139], [65, 155], [55, 134], [35, 105], [15, 86], [5, 81], [0, 80], [0, 66]],
		color: "#adbe33",
		description_hu: "Homokos iszap - agyagos iszap"
	},
	//7
	{
		points: [[0, 80], [5, 81], [15, 86], [35, 105], [55, 134], [65, 155], [49, 172], [41, 150], [33, 133], [24, 121], [17, 113], [0, 98]],
		color: "#b3df92",
		description_hu: "Iszapos homok - homokos iszap"
	},
	//8
	{
		points: [[0, 98], [17, 113], [24, 121], [33, 133], [41, 150], [49, 172], [40, 184], [37, 193], [32, 171], [25, 152], [13, 134], [6, 126], [0, 123]],
		color: "#ffc384",
		description_hu: "Homok - iszapos homok"
	},
	//9
	{
		points: [[0, 123], [6, 126], [13, 134], [25, 152], [32, 171], [37, 193], [37, 200], [24, 200], [22, 186], [17, 172], [11, 161], [0, 151]],
		color: "#ffdfb9",
		description_hu: "Homok"
	},
	//10
	{
		points: [[0, 151], [11, 161], [17, 172], [22, 186], [24, 200], [0, 200]],
		color: "#feffd1",
		description_hu: "Kavicsos homok - homok"
	},
	//11
	{
		points: [[200, 200], [94, 200], [94, 180], [79, 139], [93, 124], [98, 119], [103, 119], [200, 119]],
		color: "#a09335",
		description_hu: "Nagyon merev, finom szemcsés homok (túlkonszolidált vagy cementált)"
	},
	//12
	{
		points: [[94, 200], [37, 200], [37, 193], [40, 184], [49, 172], [65, 155], [79, 139], [94, 180], [94, 200], [37, 200]],
		color: "#f4b48e",
		description_hu: "Nagyon merev homok - agyagos homok (túlkonszolidált vagy cementált)"
	}
];

var technologycalFactors=
[
	{
		description_hu: "vert, előre gyártott vasbeton elem",
		alpha_b: 1.00, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.90, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 150, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 1.00, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.05, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 85, //palástellenállás maximuma, kötött talajnál
	},
	
	{
		description_hu: "vert, zárt végű bennmaradó acélcső",
		alpha_b: 1.00, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.75, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 120, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 1.00, //talpellenállási szorzó, kötött talajnál
		mu_sg: 0.80, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 70 //palástellenállás maximuma, kötött talajnál
	},
	
	{
		description_hu: "zárt véggel lehajtott és visszahúzott cső helyén betonozott",
		alpha_b: 1.00, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 1.10, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 160, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 1.00, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.10, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 90 //palástellenállás maximuma, kötött talajnál
	},
	
	{
		description_hu: "csavart, helyben betonozott",
		alpha_b: 0.80, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.75, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 160, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 0.90, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.25, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 100 //palástellenállás maximuma, kötött talajnál
	},
	
	{
		description_hu: "CFA-cölöp",
		alpha_b: 0.70, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.55, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 120, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 0.90, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.00, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 80 //palástellenállás maximuma, kötött talajnál
	},
	
	{
		description_hu: "fúrt, támasztófolyadék védelemmel",
		alpha_b: 0.50, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.50, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 100, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 0.80, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.00, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 80 //palástellenállás maximuma, kötött talajnál
	},
	
	{
		description_hu: "fúrt, béléscső védelemmel",
		alpha_b: 0.50, //talpellenállási szorzó, szemcsés talajnál
		alpha_sq: 0.45, //palástellenállási szorzó, szemcsés talajnál
		q_smax_gran: 80, //palástellenállás maximuma, szemcsés talajnál
		mu_b: 0.80, //talpellenállási szorzó, kötött talajnál
		mu_sg: 1.00, //palástellenállási szorzó, kötött talajnál
		q_smax_coh: 80 //palástellenállás maximuma, kötött talajnál
	}
];



function renderDrawing()
{
	var c=document.getElementById("robertson").getContext('2d');
	c.strokeStyle = "black";
	c.strokeWidth = 0.1;
	for(var i=0; i<soilCathegories.length; i++)
	{
		var x=soilCathegories[i];
		c.fillStyle=x.color;
		c.beginPath();
		c.moveTo(x.points[0][0], x.points[0][1]);
		for(var j=1; j<x.points.length; j++)
		{
			c.lineTo(x.points[j][0], x.points[j][1]);
		}
		c.closePath();
		c.fill();
		c.stroke();
	}
}


function isGranular(i)
{
	if(document.getElementById("soil_type_select").value==1)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function q_s_cal(i, factors)
{
	var x;
	if(isGranular(i))
	{
		x=Math.min(factors.alpha_sq*Math.sqrt(qcs[i]*1000), factors.q_smax_gran);
	}
	else
	{
		x=Math.min(1.2*factors.mu_sg*Math.sqrt(qcs[i]*1000), factors.q_smax_coh);
	}
	return x;
}

function calculate()
{
	//kézi input adatok
	//manual input data
	var pileHeadDepth=parseFloat(document.getElementById("pile_head_depth_input").value.replace(",", "."));
	var pileTipDepth=parseFloat(document.getElementById("pile_tip_depth_input").value.replace(",", "."));
	var diameter=parseFloat(document.getElementById("diameter_input").value.replace(",", "."));
	var soilType=document.getElementById("soil_type_select").value;
	var technology=document.getElementById("technology_select").value;
	
	var factors=technologycalFactors[technology];
	
	//Palástellenállás
	//skin resistance
	var R_s_cal_is=[];
	var iH=Math.ceil(pileHeadDepth/dy-0.5);
	var row={};
	row.i=iH;
	row.h=(iH+0.5)*dy-pileHeadDepth;
	row.isGranular=isGranular(i);
	row.qc=qcs[iH];
	row.q_s_cal=q_s_cal(iH, factors);
	row.R_s_cal_i=row.h*diameter*Math.PI*row.q_s_cal;
	R_s_cal_is.push(row);
	for(i=iH+1; ((i+0.5)*dy)<=pileTipDepth; i++)
	{
		row={};
		row.i=i;
		row.h=dy;
		row.isGranular=isGranular(i);
		row.qc=qcs[i];
		row.q_s_cal=q_s_cal(i, factors);
		row.R_s_cal_i=row.h*diameter*Math.PI*row.q_s_cal;
		R_s_cal_is.push(row);
	}
	row={};
	row.i=i;
	row.h=pileTipDepth-(i-0.5)*dy;
	row.isGranular=isGranular(i);
	row.qc=qcs[i];
	row.q_s_cal=q_s_cal(i, factors);
	row.R_s_cal_i=row.h*diameter*Math.PI*row.q_s_cal;
	R_s_cal_is.push(row);

	//console.log(R_s_cal);
	var R_s_cal=0;
	table=document.createElement("table");
	for(var i=0; i<R_s_cal_is.length; i++)
	{
		var row=table.insertRow();
		row.insertCell().textContent=R_s_cal_is[i].i;
		row.insertCell().textContent=(R_s_cal_is[i].i*dy).toFixed(2);
		row.insertCell().textContent=R_s_cal_is[i].h.toFixed(3);
		row.insertCell().textContent=R_s_cal_is[i].isGranular;
		row.insertCell().textContent=R_s_cal_is[i].qc.toFixed(2);
		row.insertCell().textContent=R_s_cal_is[i].q_s_cal.toFixed(1);
		row.insertCell().textContent=R_s_cal_is[i].R_s_cal_i.toFixed(3);
		R_s_cal+=R_s_cal_is[i].R_s_cal_i;
	}
	var cell=table.insertRow().insertCell();
	cell.setAttribute("colspan", "7");
	cell.textContent=R_s_cal.toFixed(3);
	document.body.appendChild(table);
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

