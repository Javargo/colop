//****************************************
//PILE RESEARCH
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
// 2020-05-02
// 2020-04-06	
// 2020-02-17	Start

//****************************************
//Todo

//****************************************
//Dependencies
// InputBinder.js
// constants.js

//****************************************
var canvasControl;
var cptData=[];
var dy=0.02;
var robertsonRegions=[];
var robertsonGranularRegion;
var robertsonDiagramContext;

var inputs=new InputBinder();


cptData.getIOfDepthNearest=function(y)
{
	return Math.round(y/dy);
};

cptData.getIOfDepthAbove=function(y)
{
	return Math.floor(y/dy);
};

cptData.getIOfDepthBelow=function(y)
{
	return Math.ceil(y/dy);
};

cptData.parse=function(text)
{
	this.length=0;
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
				this.push(x[1]);
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
				this.push(parseCPTLine(lines[i], i)[1]);
				lastY=0;
				isData=true;
			}
		}
	}
	
	//végigmegy a data sorain meghatározza a talaj kategóriát
	for(var i=0; i<this.length; i++)
	{
		this[i].soilCathegoryCalculated=robertsonSoilCathegory(this[i].qc, this[i].fp);
		this[i].isGranularCalculated=robertsonIsGranular(this[i].qc, this[i].fp);
		this[i].isGranularManual=this[i].isGranularCalculated;
	}
	return this;
}


function bodyLoaded(e)
{
	canvasControl=document.getElementById("paint_area");
	switchUIToEmptyState();
	renderRobertsonDiagram();
	inputs.bindFloat("pile_head_depth_input", "pileHeadDepth");
	inputs.bindFloat("pile_tip_depth_input", "pileTipDepth");
	inputs.bindFloat("diameter_input", "diameter");
	inputs.bindInt("soil_type_select", "soilType");
	inputs.bindText("technology_select", "technology");
	inputs.bindText("sand_gravel_select", "sandOrGravel");
	inputs.bindText("clay_type_select", "clayType");
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
	//c.setLineDash([]);
	c.beginPath();
	c.setLineDash([]);
	c.lineWidth=1;
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
	c.strokeStyle = "black";
	c.fillStyle = "gray";
	c.beginPath();
	c.rect(pileStripeLeft+pileStripeWidth/2-vScale*inputs.diameter/2, inputs.pileHeadDepth*vScale, inputs.diameter*vScale, (inputs.pileTipDepth-inputs.pileHeadDepth)*vScale);
	c.fill();
	c.stroke();
	
	//influencing regions
	var scaledY;
	c.beginPath();
	c.strokeStyle="black";
	c.lineWidth=2;
	c.setLineDash([3, 3]);
	if(inputs.soilType==0)
	//cohesive
	{
		scaledY=Math.round((inputs.pileTipDepth+inputs.diameter)*vScale)+0.5;
		c.moveTo(depthStripeWidth, scaledY);
		c.lineTo(c.canvas.width, scaledY);
		scaledY=Math.round((inputs.pileTipDepth+2*inputs.diameter)*vScale)+0.5;
		c.moveTo(depthStripeWidth, scaledY);
		c.lineTo(c.canvas.width, scaledY);
	}
	else
	//granular
	{
		scaledY=Math.round((inputs.pileTipDepth)*vScale)+0.5;
		c.moveTo(depthStripeWidth, scaledY);
		c.lineTo(c.canvas.width, scaledY);
		scaledY=Math.round((inputs.pileTipDepth+4*inputs.diameter)*vScale)+0.5;
		c.moveTo(depthStripeWidth, scaledY);
		c.lineTo(c.canvas.width, scaledY);
		scaledY=Math.round(tkrit(inputs.pileTipDepth, inputs.pileHeadDepth, inputs.diameter)*vScale)+0.5;
		c.moveTo(depthStripeWidth, scaledY);
		c.lineTo(c.canvas.width, scaledY);
	}
	c.stroke();
}

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


/*var y=0.21;
var i=cptData.getIOfDepthNearest(y);
console.log("Nearest "+y+" -> "+i+" -> "+(i*dy));
var i=cptData.getIOfDepthAbove(y);
console.log("Above   "+y+" -> "+i+" -> "+(i*dy));
var i=cptData.getIOfDepthBelow(y);
console.log("Below   "+y+" -> "+i+" -> "+(i*dy));*/

function qscal(i, factors)
{
	var x;
	if(cptData[i].isGranualManual==true)
	{
		x=Math.min(factors.alpha_sq*Math.sqrt(cptData[i].qc*1000), factors.q_smax_gran);
	}
	else
	{
		x=Math.min(1.2*factors.mu_sg*Math.sqrt(cptData[i].qc*1000), factors.q_smax_coh);
	}
	return x;
}

function Rscal(pileHeadDepth, pileTipDepth, factors, record)
{
	//Palástellenállás
	//skin resistance
	var sum=0;
	var table=record?record.add("rscaltable"):undefined;
	var iStart=cptData.getIOfDepthNearest(pileHeadDepth);
	var iEnd=cptData.getIOfDepthNearest(pileTipDepth);

	for(var i=iStart; i<=iEnd; i++)
	{
		var qscali=qscal(i, factors);
		sum+=qscali;
		if(record)
		{
			var row=table.add("row");
			row.add("i", i);
			row.add("h", dy);
			row.add("ig", cptData[i].isGranularManual);
			row.add("qc", cptData[i].qc.toFixed(2));
			row.add("qsccal", qscali.toFixed(2));
			row.add("sum", sum.toFixed(2));
		}
	}
	return inputs.diameter*Math.PI*sum;
}

function qcI(t, pileTipDepth, record)
{
	var sum=0;
	var n=0;
	var iStart=cptData.getIOfDepthNearest(pileTipDepth);
	var iEnd=cptData.getIOfDepthNearest(t);
	var table=record?record.add("qcitable"):undefined;
	for(var i=iStart; i<=iEnd; i++)
	{
		sum+=cptData[i].qc;
		if(record)
		{
			var row=table.add("row");
			row.add("i", i);
			row.add("qc", cptData[i].qc.toFixed(2));
			row.add("sum", sum.toFixed(2));
		}
		n++;
	}
	return sum/n;
}

function qcII(t, pileTipDepth, record)
{
	var sum=0;
	var n=0;
	var iStart=cptData.getIOfDepthNearest(pileTipDepth);
	var iEnd=cptData.getIOfDepthNearest(t);
	var min=cptData[iEnd].qc;
	var table=record?record.add("qciitable"):undefined;
	//in fact, we go from iEnd to iStart, that means upwards
	for(var i=iEnd; i>=iStart; i--)
	{
		if(cptData[i].qc<=cptData[i+1].cp && cptData[i].qc<cptData[i-1].cp)
		//this is a minimum place
		{
			if(cptData[i].qc<min)
			//this value has to be considered
			{
				sum+=cptData[i].qc;
				n++;
				min=cptData[i].qc;
				if(record)
				{
					var row=table.add("row");
					row.add("i", i);
					row.add("qc", cptData[i].qc.toFixed(2));
					row.add("sum", sum.toFixed(2));
				}
			}
		}
	}
	//checking the last value
	i=iStart;
	if(cptData[i].qc<min)
	//this value has to be considered
	{
		sum+=cptData[i].qc;
		n++;
		if(record)
		{
			var row=table.add("row");
			row.add("i", i);
			row.add("qc", cptData[i].qc.toFixed(2));
			row.add("sum", sum.toFixed(2));
		}
	}
	//checking, if have found any minimums at all
	if(n==0)
	//if not, the first value has to be added
	{
		i=iEnd;
		sum+=cptData[i].qc;
		n=1;
		if(record)
		{
			var row=table.add("row");
			row.add("i", i);
			row.add("qc", cptData[i].qc.toFixed(2));
			row.add("sum", sum.toFixed(2));
		}
	}
	return sum/n;
}

function qcIII(t, pileTipDepth, pileHeadDepth, diameter, record)
{
	//at first, we determine the lowest value from between t and pileTipDepth (qcII area)
	var iStart=cptData.getIOfDepthNearest(pileTipDepth);
	var iEnd=cptData.getIOfDepthNearest(t);
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
	var iStart=cptData.getIOfDepthNearest(Math.max(pileTipDepth-8*diameter, pileHeadDepth));
	var iEnd=cptData.getIOfDepthNearest(pileTipDepth);
	var table=record?record.add("qciiitable"):undefined;
	if(record)
	{
		table.add("startvalue", startValue.toFixed(2));
	}
	//in fact, we go from iEnd to iStart, that means upwards
	for(var i=iEnd; i>=iStart; i--)
	{
		if(cptData[i].qc<=cptData[i+1].qc && cptData[i].qc<cptData[i-1].qc)
		//this is a minimum place
		{
			if(cptData[i].qc<min)
			//this value has to be considered
			{
				sum+=cptData[i].qc;
				n++;
				min=cptData[i].qc;
				if(record)
				{
					var row=table.add("row");
					row.add("i", i);
					row.add("qc", cptData[i].qc.toFixed(2));
					row.add("sum", sum.toFixed(2));
				}
			}
		}
	}
	//checking the last value
	i=iStart;
	if(cptData[i].qc<min)
	//this value has to be considered
	{
		sum+=cptData[i].qc;
		n++;
		if(record)
		{
			var row=table.add("row");
			row.add("i", i);
			row.add("qc", cptData[i].qc.toFixed(2));
			row.add("sum", sum.toFixed(2));
		}
	}
	//checking, if have found any minimums at all
	if(n==0)
	//if not, the first value has to be added
	{
		sum=startValue;
		n=1;
		if(record)
		{
			var row=table.add("row");
			row.add("i", "*");
			row.add("qc", startValue.toFixed(2));
			row.add("sum", sum.toFixed(2));
		}
	}
	return Math.min(sum/n, 2.00);
}

function qcc(t, pileTipDepth, pileHeadDepth, diameter, record)
{
	var qc1=qcI(t, pileTipDepth, record);
	var qc2=qcII(t, pileTipDepth, record);
	var qc3=qcIII(t, pileTipDepth, pileHeadDepth, diameter, record);
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
	var iStart=cptData.getIOfDepthNearest(pileTipDepth+diameter);
	var iEnd=cptData.getIOfDepthNearest(pileTipDepth+2*diameter);
	for(var i=iStart; i<=iEnd; i++)
	{
		sum+=cptData[i].qc;
		n++;
	}
	return sum/n;
}

function granularProportionInRange(yStart, yEnd)
{
	var granulars=0;
	var n=0;
	var iStart=cptData.getIOfDepthNearest(yStart);
	var iEnd=cptData.getIOfDepthNearest(yEnd);
	for(var i=iStart; i<=iEnd; i++)
	{
		if(cptData[i].isGranularManual==true)
		{
			granulars++;
		}
		n++;
	}
	return granulars/n;
}

function granularOrCohesiveSuggestion(pileTipDepth, diameter, qbcalGranular, qbcalCohesive)
{
	//proportion of granular layers in the influence range of the calculation method for granular soils
	var granularRangeGranularProportion=granularProportionInRange(pileTipDepth, pileTipDepth+4*diameter);
	//proportion of cohesive layers in the influence range of the calculation method for cohesive soils
	var cohesiveRangeCohesiveProportion=1-granularProportionInRange(pileTipDepth+1*diameter, pileTipDepth+2*diameter);
	if(qbcalGranular>=qbcalCohesive)
	{
		if(granularRangeGranularProportion>=0.75)
		{
			return 1; //granular suggested
		}
		else
		{
			return 0; //cohseive suggested
		}
	}
	else
	{
		if(cohesiveRangeCohesiveProportion>=0.75)
		{
			return 0; //cohseive suggested
		}
		else
		{
			return 1; //granular suggested
		}
	}
}

function calculate()
{
	renderData();
	showSoilTypeSuggestion();
	var lambda_b=inputs.sandOrGravel==0?0.6:0.8;
	var factors=technologycalFactors[inputs.technology];
	var RscalValue=Rscal(inputs.pileHeadDepth, inputs.pileTipDepth, factors);
	var t=tkrit(inputs.pileTipDepth, inputs.pileHeadDepth, inputs.diameter);
	var qbcalGranular=lambda_b*factors.alpha_b*qcc(t, inputs.pileTipDepth, inputs.pileHeadDepth, inputs.diameter);
	var qbcalCohesive=factors.mu_b*9*qcCu(inputs.pileTipDepth, inputs.diameter)/Nkts[inputs.clayType];
		
	if(document.getElementById("automatic_checkbox").checked==true)
	{
		inputs.soilType=granularOrCohesiveSuggestion(inputs.pileTipDepth, inputs.diameter, qbcalGranular, qbcalCohesive);
		switchSoilType();
	}
	
	var Rbcal=inputs.diameter*inputs.diameter/4*Math.PI*(inputs.soilType==1?qbcalGranular:qbcalCohesive)*1000;	
	var Rcal=RscalValue+Rbcal;
	
	var outputArea=document.getElementById("output_area");
	outputArea.innerHTML="";
	outputArea.textContent+=("Rscal = "+RscalValue.toFixed(2)+"\n");
	outputArea.textContent+=("tkrit = "+t.toFixed(2)+"\n");
	outputArea.textContent+=("qcI = "+qcI(t, inputs.pileTipDepth).toFixed(3)+"\n");
	outputArea.textContent+=("qcII = "+qcII(t, inputs.pileTipDepth).toFixed(3)+"\n");
	outputArea.textContent+=("qcIII = "+qcIII(t, inputs.pileTipDepth, inputs.pileHeadDepth, inputs.diameter).toFixed(3)+"\n");
	outputArea.textContent+=("qbcal (granular) = "+qbcalGranular.toFixed(2)+"\n");
	outputArea.textContent+=("qbcal (cohesive) = "+qbcalCohesive.toFixed(2)+"\n");
	outputArea.textContent+=("Rbcal = "+Rbcal.toFixed(2)+"\n");
	outputArea.textContent+=("Rcal = "+Rcal.toFixed(2)+"\n");
	
	switchUIToCalulated();
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
		cptData.parse(event.target.result);
		switchUIToWorkingState();
		calculate();
	});
	fr.readAsText(e.target.files[0]);
}

function menuCommandShowDetailedResults(e)
{
	var record=new XmlTree("root");
	record.add("dy", dy.toFixed(2));
	var pileProperties=record.add("pileproperties");
	pileProperties.add("pileheaddepth", inputs.pileHeadDepth.toFixed(2));
	pileProperties.add("piletipdepth", inputs.pileTipDepth.toFixed(2));
	pileProperties.add("diameter", inputs.diameter.toFixed(2));
	pileProperties.add("technology", inputs.technology);
	
	var calculation=record.add("calculation");
	
	var cptTable=record.add("cpttable");
	for(var i=0; i<cptData.length; i++)
	{
		var row=cptTable.add("row");
		row.add("y", (i*dy).toFixed(2));
		row.add("qc", cptData[i].qc.toFixed(2));
		row.add("fp", cptData[i].fp.toFixed(2));
		row.add("scc", cptData[i].soilCathegoryCalculated);
		row.add("igc", cptData[i].isGranularCalculated);
		row.add("igm", cptData[i].isGranularManual);
		
	}
	
	var lambda_b=inputs.sandOrGravel==0?0.6:0.8;
	var factors=technologycalFactors[inputs.technology];
	calculation.add("lambdab", lambda_b.toFixed(2));
	calculation.add("alphab", factors.alpha_b.toFixed(2));
	calculation.add("alphasq", factors.alpha_sq.toFixed(2));
	calculation.add("qsmaxgran", factors.q_smax_gran.toFixed(0));
	calculation.add("mub", factors.mu_b.toFixed(2));
	calculation.add("musg", factors.mu_sg.toFixed(2));
	calculation.add("qsmaxcoh", factors.q_smax_coh.toFixed(0));
	calculation.add("gammab", factors.gamma_b.toFixed(2));
	calculation.add("gammas", factors.gamma_s.toFixed(2));
	calculation.add("gammastpull", factors.gamma_st_pull.toFixed(2));
	calculation.add("gammastbuoyingup", factors.gamma_st_buoyingup.toFixed(2));
	calculation.add("gammat", factors.gamma_t.toFixed(2));

	var RscalValue=Rscal(inputs.pileHeadDepth, inputs.pileTipDepth, factors, calculation);
	calculation.add("rscal", RscalValue.toFixed(2));
	
	var t=tkrit(inputs.pileTipDepth, inputs.pileHeadDepth, inputs.diameter);
	calculation.add("tkrit", t.toFixed(2));
	var qcIValue=qcI(t, inputs.pileTipDepth, calculation);
	calculation.add("qci", qcIValue.toFixed(2));
	var qcIIValue=qcII(t, inputs.pileTipDepth, calculation);
	calculation.add("qcii", qcIIValue.toFixed(2));
	var qcIIIValue=qcIII(t, inputs.pileTipDepth, inputs.pileHeadDepth, inputs.diameter, calculation);
	calculation.add("qciii", qcIIIValue.toFixed(2));

	var qbcalGranular=lambda_b*factors.alpha_b*qcc(t, inputs.pileTipDepth, inputs.pileHeadDepth, inputs.diameter);
	calculation.add("qbcalgranular", qbcalGranular.toFixed(2));
	//var qbcalCohesive=factors.mu_b*9*qcCu(inputs.pileTipDepth, inputs.diameter)/Nkts[inputs.clayType];
		
	//if(document.getElementById("automatic_checkbox").checked==true)
	//{
	//	inputs.soilType=granularOrCohesiveSuggestion(inputs.pileTipDepth, inputs.diameter, qbcalGranular, qbcalCohesive);
	//	switchSoilType();
	//}
	
	//var Rbcal=inputs.diameter*inputs.diameter/4*Math.PI*(inputs.soilType==1?qbcalGranular:qbcalCohesive)*1000;	
	//var Rcal=RscalValue+Rbcal;

	
	//console.log(record.toString());
	
	var xsltProcessor = new XSLTProcessor();
	var stylesheet=loadXMLFileSync("all.xsl");
	xsltProcessor.importStylesheet(stylesheet);
	var w=window.open("", "_blank");
	var resultFragment = xsltProcessor.transformToFragment(record, w.document);
	w.document.removeChild(w.document.firstChild);
	w.document.appendChild(resultFragment.firstChild);
	//Data URL-lel is lehetne valahogy
	//https://stackoverflow.com/questions/27798126/how-to-open-the-newly-created-image-in-a-new-tab

}

function displaySoilTypeSuggestion()
{

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
	switchSoilType();
}

function switchUIToCalulated()
{
	document.getElementById("result_button").disabled=false;
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
	//if(document.getElementById("soil_type_select").value==0)
	if(inputs.soilType==0)
	{
		switchSoilTypeToCohesive();
	}
	else
	{
		switchSoilTypeToGranular();
	}
	renderData();
}

function showSoilTypeSuggestion()
{
	//Azt kellene csinálni, hogy meghatározza kötöttre és szemcsésre is.
	//A nagyobbikat akkor javasolja, ha a feltételei 80%-ban fennállnak.
	//Azaz kötöttnél a csúcs alatti 2d tartomány túlnyomóan kötött
	//Szemcsésnél a csúcs alatti 4 d tartomány túlnyomóan szemcsés.
	
	var grp=granularProportionInRange(inputs.pileTipDepth, inputs.pileTipDepth+4*inputs.diameter);
	var cop=1-granularProportionInRange(inputs.pileTipDepth+1*inputs.diameter, inputs.pileTipDepth+2*inputs.diameter);
	document.getElementById("soil_type_label").textContent="Talaj típusa a csúcs alatt ("+(grp*100).toFixed(0)+"% szemcsés; "+(cop*100).toFixed(0)+"% kötött)";
}


