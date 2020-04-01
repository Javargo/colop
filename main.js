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
var cptData=[];
var dy=0.02;
var robertsonRegions=[];
var robertsonGranularRegion;
var robertsonDiagramContext;
//var isCalculable=false;


function bodyLoaded(e)
{
	canvasControl=document.getElementById("paint_area");
	//smartizeCanvas(canvasControl);
	switchUIToEmptyState();
	renderRobertsonDiagram();
};


function parseCPTLine(line, i)
{
	var yCol=0;
	var qcCol=1;
	var fpCol=4;
	var s=line.trim().split("\t");
	if(s.length<Math.max(yCol, qcCol, fpCol))
	{
		throw "A(z) "+(i+1)+". sorban az oszlopok száma kevés!";
	}
	
	var y=parseFloat(s[yCol].replace(",", "."));
	if(y==NaN)
	{
		throw "A(z) "+(i+1)+". sorban nem lehet beolvasni az y értéket, mert a(z) "+(yCol+1)+". oszlop nem számot tartalmaz.";
	}
	var qc=parseFloat(s[qcCol].replace(",", "."));
	if(qc==NaN)
	{
		throw "A(z) "+(i+1)+". sorban nem lehet beolvasni a qc értéket, mert a(z) "+(qcCol+1)+". oszlop nem számot tartalmaz.";
	}
	var fp=parseFloat(s[fpCol].replace(",", "."));
	if(fp==NaN)
	{
		throw "A(z) "+(i+1)+". sorban nem lehet beolvasni az fp értéket, mert a(z) "+(fpCol+1)+". oszlop nem számot tartalmaz.";
	}
	return [y, {"qc": qc, "fp": fp}];
}

function parseCPTData(text)
{
	var data=[];
	var lines=text.split("\n");
	while(lines[lines.length-1].length==0)
	{
		lines.pop();
	}
	var isData=false;
	var lastY;
	for(var i=0; i<lines.length; i++)
	{
		if(isData==true)
		{
			var x=parseCPTLine(lines[i], i);
			var y=x[0];
			if(Math.round(y*100)==Math.round((lastY+dy)*100))
			{
				data.push(x[1]);
				lastY=y;
			}
			else
			{
				throw "CPT adatsor nem folytonos "+y.toFixed(2)+" m mélységnél. Az várt érték "+(lastY+dy).toFixed(2)+" m.";
			}
		}
		else
		{
			var s=lines[i].trim().split("\t");
			y=parseFloat(s[0].replace(",", "."));
			if(y==0)
			{
				data.push(parseCPTLine(lines[i], i)[1]);
				lastY=0;
				isData=true;
			}
		}
	}
	
	//végigmegy a data sorain meghatározza a talaj kategóriát
	for(var i=0; i<data.length; i++)
	{
		data[i].soilCathegoryCalculated=robertsonSoilCathegory(data[i].qc, data[i].fp);
		data[i].isGranularCalculated=robertsonIsGranular(data[i].qc, data[i].fp);
	}
	return data;
}

function renderData()
{
	//maximal qc value
	var max_qc=0;
	for(var i=0; i<cptData.length; i++)
	{
		if(cptData[i].qc>max_qc)
		{
			max_qc=cptData[i].qc;
		}
	}
	
	//set up
	var c=canvasControl.getContext('2d');
	var depthStripeWidth=20;
	var soilTypeStripeLeft=depthStripeWidth;
	var soilTypeStripeWidth=10;
	var space1StripeLeft=soilTypeStripeLeft+soilTypeStripeWidth;
	var space1StripeWidth=5;
	var qcStripeLeft=space1StripeLeft+space1StripeWidth;
	var qcStripeWidth=200;
	var pileStripeLeft=qcStripeLeft+qcStripeWidth
	var pileStripeWidth=c.canvas.width-pileStripeLeft;
	
	//var leftSideWidth=c.canvas.width*0.65;
	//var rightSideWidth=c.canvas.width-leftSideWidth;
	var qcScale=qcStripeWidth/max_qc;
	var vScale=c.canvas.height/cptData.length/dy;
	c.fillStyle = "white";
	c.fillRect(0, 0, c.canvas.width, c.canvas.height);
	
	for(var i=0; i<cptData.length; i++)
	{
		if(cptData[i].isGranularCalculated==true)
		{
			c.fillStyle = "yellow";
		}
		else
		{
			c.fillStyle = "blue";
		}
		c.fillRect(soilTypeStripeLeft, (i-0.5)*dy*vScale, soilTypeStripeWidth, dy*vScale);
	}
	
	//lines in each meter
	c.strokeStyle="gray";
	c.fillStyle="gray";
	c.beginPath();
	for(var y=0; y<=cptData.length*dy; y++)
	{
		var scaledY=Math.round(y*vScale)+0.5;
		c.moveTo(0, scaledY);
		c.lineTo(c.canvas.width, scaledY);
		c.fillText("-"+y.toFixed(0), 0, scaledY-2);
	}
	c.stroke();
	
	//cpt diagram
	c.strokeStyle = "red";
	c.beginPath();
	c.moveTo(qcStripeLeft+cptData[0].qc*qcScale, 0*vScale);
	for(var i=1; i<cptData.length; i++)
	{
		c.lineTo(qcStripeLeft+cptData[i].qc*qcScale, i*dy*vScale);
	}
	c.stroke();
	
	
	//pile geometry
	var pileHeadDepth=parseFloat(document.getElementById("pile_head_depth_input").value.replace(",", "."));
	var pileTipDepth=parseFloat(document.getElementById("pile_tip_depth_input").value.replace(",", "."));
	var diameter=parseFloat(document.getElementById("diameter_input").value.replace(",", "."));
	c.strokeStyle = "black";
	c.fillStyle = "gray";
	c.beginPath();
	c.rect(pileStripeLeft+pileStripeWidth/2-vScale*diameter/2, pileHeadDepth*vScale, diameter*vScale, (pileTipDepth-pileHeadDepth)*vScale);
	c.fill();
	c.stroke();
}


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

granularPoints=[[0,200], [0,66], [15,62], [23,67], [47,87], [62,106], [75,128], [79,139], [94,180], [94,200]];

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

var Nkts=
[
	13,
	15,
	17
];


function renderRobertsonDiagram()
{
	var c=document.getElementById("robertson").getContext('2d');
	robertsonDiagramContext=c;
	c.strokeStyle = "black";
	c.lineWidth = 0.2;
	for(var i=0; i<soilCathegories.length; i++)
	{
		var x=soilCathegories[i];
		c.fillStyle=x.color;
		var path=new Path2D();
		path.moveTo(x.points[0][0], x.points[0][1]);
		for(var j=1; j<x.points.length; j++)
		{
			path.lineTo(x.points[j][0], x.points[j][1]);
		}
		path.closePath();
		c.fill(path);
		c.stroke(path);
		robertsonRegions.push(path);		
	}
	
	//granular region
	c.lineWidth=2;
	var path=new Path2D();
	path.moveTo(granularPoints[0][0], granularPoints[0][1]);
	for(var j=1; j<granularPoints.length; j++)
		{
			path.lineTo(granularPoints[j][0], granularPoints[j][1]);
		}
	path.closePath();
	c.stroke(path);
	robertsonGranularRegion=path;
}

function robertsonSoilCathegory(qc, rf)
{
	if(qc<=0.1)
	//below the diagram
	{
		return 1;
	}
	else
	{
		var x=rf*20;
		var y=Math.log(qc)/Math.LN10*200/3+200/3;
		robertsonDiagramContext.fillStyle="black";
		robertsonDiagramContext.beginPath();
		robertsonDiagramContext.arc(x, y, 1, 0, 2*Math.PI);
		robertsonDiagramContext.fill();
		for(var i=0; i<robertsonRegions.length; i++)
		{
			if(robertsonDiagramContext.isPointInPath(robertsonRegions[i], x, y, "evenodd")==true)
			{
				return(i);
			}
		}
		return NaN;
	}
	//throw "No respective soil cathegory found for qc="+qc+" rf="+rf;
}

function robertsonIsGranular(qc, rf)
{
	if(qc<=0.1)
	//below the diagram
	{
		return false;
	}
	else
	{
		if(rf>=10)
		//right from the diagram
		{
			return false;
		}
		else
		{
			if(qc>=100)
			//above the diagram
			{
				if(rf>=94/20)
				{
					return false;
				}
				else
				{
					return true;
				}
			}
			else
			{
				var x=rf*20;
				var y=Math.log(qc)/Math.LN10*200/3+200/3;
				return robertsonDiagramContext.isPointInPath(robertsonGranularRegion, x, y, "evenodd");
			}
		}
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

function qscal(i, factors)
{
	var x;
	if(isGranular(i))
	{
		x=Math.min(factors.alpha_sq*Math.sqrt(cptData[i].qc*1000), factors.q_smax_gran);
	}
	else
	{
		x=Math.min(1.2*factors.mu_sg*Math.sqrt(cptData[i].qc*1000), factors.q_smax_coh);
	}
	return x;
}

function qcI(t, pileTipDepth)
{
	//var rows=[];
	var sum=0;
	var n=0;
	var iStart=Math.ceil(pileTipDepth/dy+0.5);
	var iEnd=Math.floor(t/dy+0.5);
	for(var i=iStart; i<=iEnd; i++)
	{
		//row={};
		//row.i=i;
		//row.qc=cptData[i].qc;
		//rows.push(row);
		sum+=cptData[i].qc;
		n++;
	}
	return sum/n;
}

function qcII(t, pileTipDepth)
{
	var sum=0;
	var n=0;
	var iStart=Math.ceil(pileTipDepth/dy+0.5);
	var iEnd=Math.floor(t/dy+0.5);
	var min=cptData[iEnd].qc;
	//in fact, we go from iEnd to iStart, that means upwards
	for(var i=iEnd; i>=iStart; i--)
	{
		//row={};
		//row.i=i;
		//row.qc=cptData[i].qc;
		//rows.push(row);
		if(cptData[i].qc<=cptData[i+1].cp && cptData[i].qc<cptData[i-1].cp)
		//this is a minimum place
		{
			if(cptData[i].qc<min)
			//this value has to be considered
			{
				sum+=cptData[i].qc;
				n++;
				min=cptData[i].qc;
			}
		}
	}
	//checking the last value
	if(cptData[iStart].qc<min)
	//this value has to be considered
	{
		sum+=cptData[iStart].qc;
		n++;
	}
	//checking, if have found any minimums at all
	if(n==0)
	//if not, the first value has to be added
	{
		sum+=cptData[iEnd].qc;
		n=1;
	}
	return sum/n;
}

function qcIII(t, pileTipDepth, pileHeadDepth, diameter)
{
	//at first, we determine the lowest value from between t and pileTipDepth (qcII area)
	var iStart=Math.ceil(pileTipDepth/dy+0.5);
	var iEnd=Math.floor(t/dy+0.5);
	var min=cptData[iEnd].qc;
	for(var i=iEnd; i>=iStart; i--)
	{
		if(cptData[i].qc<=cptData[i+1].qc && cptData[i].qc<cptData[i-1].qc)
		//this is a minimum place
		{
			if(cptData[i].qc<min)
			//this value has to be considered
			{
				min=cptData[i].qc;
			}
		}
	}
	if(cptData[iStart].qc<min)
	//this value has to be considered
	{
		min=cptData[iStart].qc;
	}
	var startValue=min;
	
	//now, we start with qcIII
	var sum=0;
	var n=0;
	var iStart=Math.ceil(pileTipDepth/dy+0.5);
	var iEnd=Math.floor(Math.max(pileTipDepth-8*diameter, pileHeadDepth)/dy+0.5);
	//in fact, we go from iEnd to iStart, that means upwards
	for(var i=iEnd; i>=iStart; i--)
	{
		//row={};
		//row.i=i;
		//row.qc=cptData[i].qc;
		//rows.push(row);
		if(cptData[i].qc<=cptData[i+1].qc && cptData[i].qc<cptData[i-1].qc)
		//this is a minimum place
		{
			if(cptData[i].qc<min)
			//this value has to be considered
			{
				sum+=cptData[i].qc;
				n++;
				min=cptData[i].qc;
			}
		}
	}
	//checking the last value
	if(cptData[iStart].qc<min)
	//this value has to be considered
	{
		sum+=cptData[iStart].qc;
		n++;
	}
	//checking, if have found any minimums at all
	if(n==0)
	//if not, the first value has to be added
	{
		sum=startValue;
		n=1;
	}
	return Math.min(sum/n, 2.00);
}

function qcc(t, pileTipDepth, pileHeadDepth, diameter)
{
	var qc1=qcI(t, pileTipDepth);
	var qc2=qcII(t, pileTipDepth);
	var qc3=qcIII(t, pileTipDepth, pileHeadDepth, diameter);
	return 0.5*qc1+0.25*(qc2+qc3);
}

function tkrit(pileTipDepth, pileHeadDepth, diameter)
{
	var yStart=Math.round((pileTipDepth+0.7*diameter)*50)/50;
	var yEnd=Math.round((pileTipDepth+4*diameter)*50)/50;
	var yMin=yStart;
	var min=qcc(yMin, pileTipDepth, pileHeadDepth, diameter);
	for(var y=yStart; y<=yEnd; y+=0.02)
	{
		var x=qcc(y, pileTipDepth, pileHeadDepth, diameter);
		if(x<min)
		{
			min=x;
			yMin=y;
		}
	}
	return yMin;
}

function qcCu(pileTipDepth, diameter)
{
	var sum=0;
	var n=0;
	var iStart=Math.ceil((pileTipDepth+diameter)/dy+0.5);
	var iEnd=Math.floor((pileTipDepth+2*diameter)/dy+0.5);
	for(var i=iStart; i<=iEnd; i++)
	{
		sum+=cptData[i].qc;
		n++;
	}
	return sum/n;
}

function calculate()
{
	renderData();
	//kézi input adatok
	//manual input data
	var pileHeadDepth=parseFloat(document.getElementById("pile_head_depth_input").value.replace(",", "."));
	var pileTipDepth=parseFloat(document.getElementById("pile_tip_depth_input").value.replace(",", "."));
	var diameter=parseFloat(document.getElementById("diameter_input").value.replace(",", "."));
	var soilType=document.getElementById("soil_type_select").value;
	var technology=document.getElementById("technology_select").value;
	var sand_or_gravel=document.getElementById("sand_gravel_select").value;
	var clayType=document.getElementById("clay_type_select").value;
	var lambda_b=sand_or_gravel==0?0.6:0.8;
	var factors=technologycalFactors[technology];
	
	//Palástellenállás
	//skin resistance
	var rows=[];
	var i=Math.floor(pileHeadDepth/dy+0.5);
	var row={};
	row.i=i;
	row.h=(i+0.5)*dy-pileHeadDepth;
	row.isGranular=isGranular(i);
	row.qc=cptData[i].qc;
	row.qscal=qscal(i, factors);
	row.Rscali=row.h*diameter*Math.PI*row.qscal;
	rows.push(row);
	for(i++; ((i+0.5)*dy)<=pileTipDepth; i++)
	{
		row={};
		row.i=i;
		row.h=dy;
		row.isGranular=isGranular(i);
		row.qc=cptData[i].qc;
		row.qscal=qscal(i, factors);
		row.Rscali=row.h*diameter*Math.PI*row.qscal;
		rows.push(row);
	}
	row={};
	row.i=i;
	row.h=pileTipDepth-(i-0.5)*dy;
	row.isGranular=isGranular(i);
	row.qc=cptData[i].qc;
	row.qscal=qscal(i, factors);
	row.Rscali=row.h*diameter*Math.PI*row.qscal;
	rows.push(row);

	var Rscal=0;
	table=document.createElement("table");
	table.setAttribute("class", "sum_table");
	for(var i=0; i<rows.length; i++)
	{
		var row=table.insertRow();
		row.insertCell().textContent=rows[i].i;
		row.insertCell().textContent=(rows[i].i*dy).toFixed(2);
		row.insertCell().textContent=rows[i].h.toFixed(3);
		row.insertCell().textContent=rows[i].isGranular;
		row.insertCell().textContent=rows[i].qc.toFixed(2);
		row.insertCell().textContent=rows[i].qscal.toFixed(1);
		row.insertCell().textContent=rows[i].Rscali.toFixed(3);
		Rscal+=rows[i].Rscali;
	}
	var cell=table.insertRow().insertCell();
	cell.setAttribute("colspan", "7");
	cell.textContent=Rscal.toFixed(3);
	//document.body.appendChild(table);
	
	var outputArea=document.getElementById("output_area");
	outputArea.innerHTML="";
	outputArea.textContent+=("Rscal = "+Rscal.toFixed(2)+"\n");	
	
	var qbcal;
	if(soilType==1)
	//granular
	{
		var t=tkrit(pileTipDepth, pileHeadDepth, diameter);
		qbcal=lambda_b*factors.alpha_b*qcc(t, pileTipDepth, pileHeadDepth, diameter);
		outputArea.textContent+=("tkrit = "+t.toFixed(2)+"\n");
		outputArea.textContent+=("qcI = "+qcI(t, pileTipDepth).toFixed(3)+"\n");
		outputArea.textContent+=("qcII = "+qcII(t, pileTipDepth).toFixed(3)+"\n");
		outputArea.textContent+=("qcIII = "+qcIII(t, pileTipDepth, pileHeadDepth, diameter).toFixed(3)+"\n");
	}
	else
	//cohesive
	{
		qbcal=factors.mu_b*9*qcCu(pileTipDepth, diameter)/Nkts[clayType];
	}
	var Rbcal=diameter*diameter/4*Math.PI*qbcal*1000;	
	outputArea.textContent+=("Rbcal = "+Rbcal.toFixed(2)+"\n");
	
}

//****************************
// UI HANDLING
//****************************

function menuCommandLoad(e)
{
	document.getElementById("data_file_button").value=e.target.files[0].name;
	var fr=new FileReader();
	fr.addEventListener("load", function(e)
	{
		cptData=parseCPTData(event.target.result);
		switchUIToWorkingState();
		calculate();
	});
	fr.readAsText(e.target.files[0]);
}

function switchUIToEmptyState()
{
	document.getElementById("pile_head_depth_input").disabled=true;
	document.getElementById("pile_tip_depth_input").disabled=true;
	document.getElementById("diameter_input").disabled=true;
	document.getElementById("soil_type_select").disabled=true;
	document.getElementById("technology_select").disabled=true;
	document.getElementById("clay_type_select").disabled=true;
	document.getElementById("sand_gravel_select").disabled=true;
	document.getElementById("result_button").disabled=true;
}

function switchUIToWorkingState()
{
	document.getElementById("pile_head_depth_input").disabled=false;
	document.getElementById("pile_tip_depth_input").disabled=false;
	document.getElementById("diameter_input").disabled=false;
	document.getElementById("soil_type_select").disabled=false;
	document.getElementById("technology_select").disabled=false;
	document.getElementById("clay_type_select").disabled=false;
	document.getElementById("sand_gravel_select").disabled=false;
	//document.getElementById("result_button").disabled=false;
	switchSoilType();
}

function switchSoilTypeToCohesive()
{
	document.getElementById("clay_type_label").style.display="initial";
	document.getElementById("clay_type_select").style.display="initial";
	document.getElementById("sand_gravel_label").style.display="none";
	document.getElementById("sand_gravel_select").style.display="none";
}

function switchSoilTypeToGranular()
{
	document.getElementById("clay_type_label").style.display="none";
	document.getElementById("clay_type_select").style.display="none";
	document.getElementById("sand_gravel_label").style.display="initial";
	document.getElementById("sand_gravel_select").style.display="initial";
}

function switchSoilType()
{
	if(document.getElementById("soil_type_select").value==0)
	{
		switchSoilTypeToCohesive();
	}
	else
	{
		switchSoilTypeToGranular();
	}
}

//****************************
// Attaches mouse actions to canvas
//****************************
/*
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
*/

