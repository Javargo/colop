<?xml version="1.0"?>
<!-- 
Transformation for the pile calcalulation output

Copyright: 
Major, Balázs 
majorstructures@gmail.com

Change log:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
2020-05-03 Started 

Todo:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
-->

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:math="http://exslt.org/math"
	xmlns:comm="http://exslt.org/common"
	xmlns:svg="http://www.w3.org/2000/svg"
	xmlns:mml="http://www.w3.org/1998/Math/MathML"
	>
	<!-- *   V A R I A B L E S   * -->
	
	<xsl:variable name="technologynames">
		<option value="0">vert, előregyártott vasbeton elem</option>
		<option value="1">vert, zárt végű bennmaradó acélcső</option>
		<option value="2">zárt véggel lehajtott és visszahúzott cső
helyén betonozott</option>
		<option value="3">csavart, helyben betonozott</option>
		<option value="4">CFA-cölöp</option>
		<option value="5">fúrt, támasztófolyadék védelemmel</option>
		<option value="6">fúrt, béléscső védelemmel</option>
	</xsl:variable>

	<!-- *   M A I N   * -->
	<xsl:template match="/root">
		<html>
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
				<title>Részletes eredmények</title>
				<style>
					table
					{
						border-collapse:collapse;
					}
					
					table.noframe, table.noframe td
					{
						border: none;
					}
					
					table, th, td
					{
						border: 1px solid black;
					}
					
					th
					{
						background-color: #dddddd;
					}
				</style>
			</head>
			<body>

				<h1>Cölöp teherbírásának meghatározása</h1>
				<h2>Kiindulási adatok</h2>
				<table class="noframe">
					<tr>
						<td>Cölöpfej mélysége (a fejtömb alsó síkja)</td>
						<td><xsl:value-of select="/root/pileproperties/pileheaddepth"/><xsl:text> m</xsl:text></td>
					</tr>
					<tr>
						<td>Cölöptalp mélysége</td>
						<td><xsl:value-of select="/root/pileproperties/piletipdepth"/><xsl:text> m</xsl:text></td>
					</tr>
					<tr>
						<td>Cölöp átmérője</td>
						<td><xsl:value-of select="/root/pileproperties/diameter"/><xsl:text> m</xsl:text></td>
					</tr>
					<tr>
						<td>Technológia</td>
						<xsl:variable name="t" select="/root/pileproperties/technology"/>
						<td><xsl:value-of select="comm:node-set($technologynames)/option[@value = $t]"/></td>
					</tr>
					<tr>
						<td>a CPT szondázás adatrögzítési sűrűsége</td>
						<td><xsl:value-of select="/root/dy"/><xsl:text> m</xsl:text></td>
					</tr>
				</table>
				
				<!--xsl:call-template name="showcpttable"/-->
				
				<h2>Palástellenállás</h2>
				<xsl:call-template name="showrscaltable"/>
				<h2>Talpellenállás</h2>
				<h3>Kötött talajt feltételezve</h3>
				
				<h3>Szemcsés talajt feltételezve</h3>
				<p>q<sub>cI</sub></p>
				<xsl:call-template name="showqcitable"/>
				<p>q<sub>cII</sub></p>
				<xsl:call-template name="showqciitable"/>
				<p>q<sub>cIII</sub></p>
				<xsl:call-template name="showqciiitable"/>
				<p>
				q<sub>b;cal</sub>=
				&#955;<sub>b</sub>&#183;&#945;<sub>b</sub>&#183;0,5&#183;(q<sub>cIII</sub>+0,5&#183;(q<sub>cI</sub>+q<sub>cII</sub>))=
				<xsl:value-of select="/root/calculation/lambdab"/>&#183;<xsl:value-of select="/root/calculation/alphab"/>&#183;0,5&#183;(<xsl:value-of select="/root/calculation/qciii"/>+0,5&#183;(<xsl:value-of select="/root/calculation/qci"/>+<xsl:value-of select="/root/calculation/qcii"/>))=
				<xsl:value-of select="/root/calculation/qbcalgranular"/>
				</p>
				
				<h3>A talaj jellege</h3>
				<!--milyen részben kötött, illetev szemcsés -->
				<!--Automatikus vagy kézi választás -->
				<!--Talajfajta -->
				<h3>A talpellenállás értéke</h3>
				<h2>A cölöp teljes ellenállása</h2>
				
				
			</body>
		</html>
	</xsl:template>

<!-- *   B A S I C   C O M P O N E N T S   * -->

<!-- CPT TABLE -->
	<xsl:template name="showcpttable">
		<table>
			<tr>
				<td>y</td>
				<td>A pont mélysége</td>
			</tr>
			<tr>
				<td>qc</td>
				<td>Csúcsellenállás</td>
			</tr>
			<tr>
				<td>fp</td>
				<td>A csúcsellenállás és palástsúrlódás aránya</td>
			</tr>
			<tr>
				<td>scc</td>
				<td>Robertson diagramm alapján meghatározott talaj kategória</td>
			</tr>
			<tr>
				<td>igc</td>
				<td>Robertson diagramm alapján meghatározott talaj típus (szemcsés vagy kötött)</td>
			</tr>
			<tr>
				<td>igm</td>
				<td>Felhasználó által felülbírált talaj típus (szemcsés vagy kötött)</td>
			</tr>
		</table>
		
		<table>
			<tr>
				<td>1</td>
				<td>Érzékeny, finom szemcsés talaj</td>
			</tr>
			<tr>
				<td>2</td>
				<td>Szerves talaj, tőzeg</td>
			</tr>
			<tr>
				<td>3</td>
				<td>Agyag</td>
			</tr>
			<tr>
				<td>4</td>
				<td>Iszapos agyag - agyag</td>
			</tr>
			<tr>
				<td>5</td>
				<td>Agyagos iszap - iszapos agyag</td>
			</tr>
			<tr>
				<td>6</td>
				<td>Homokos iszap - agyagos iszap</td>
			</tr>
			<tr>
				<td>7</td>
				<td>Iszapos homok - homokos iszap</td>
			</tr>
			<tr>
				<td>8</td>
				<td>Homok - iszapos homok</td>
			</tr>
			<tr>
				<td>9</td>
				<td>Homok</td>
			</tr>
			<tr>
				<td>10</td>
				<td>Kavicsos homok - homok</td>
			</tr>
			<tr>
				<td>11</td>
				<td>Nagyon merev, finom szemcsés homok (túlkonszolidált vagy cementált)</td>
			</tr>
			<tr>
				<td>12</td>
				<td>Nagyon merev homok - agyagos homok (túlkonszolidált vagy cementált)</td>
			</tr>
		</table>
		
		<table>
			<thead>
				<tr>
					<th>y</th>
					<th>qc</th>
					<th>fp</th>
					<th>scc</th>
					<th>igc</th>
					<th>igm</th>
				</tr>
			</thead>
			<tbody>
				<xsl:for-each select="/root/cpttable/row">
					<tr>
						<td><xsl:value-of select="y"/></td>
						<td><xsl:value-of select="qc"/></td>
						<td><xsl:value-of select="fp"/></td>
						<td><xsl:value-of select="scc + 1"/></td>
						<td><xsl:value-of select="igc"/></td>
						<td><xsl:value-of select="igm"/></td>
					</tr>
				</xsl:for-each>
			</tbody>
		</table>
	</xsl:template>
	
<!-- RSCAL TABLE -->
	<xsl:template name="showrscaltable">
		<table>
			<thead>
				<tr>
					<th>i</th>
					<th>y</th>
					<th>h</th>
					<th>ig</th>
					<th>qc</th>
					<th>qsccal</th>
					<th>&#931;</th>
				</tr>
			</thead>
			<tbody>
				<xsl:for-each select="/root/calculation/rscaltable/row">
					<tr>
						<td><xsl:value-of select="i"/></td>
						<td><xsl:value-of select="format-number(i * /root/dy, '0.00')"/></td>
						<td><xsl:value-of select="h"/></td>
						<td>
							<xsl:choose>
								<xsl:when test="ig = 'true'">
									<xsl:text>sz</xsl:text>
								</xsl:when>
								<xsl:otherwise>
									<xsl:text>k</xsl:text>
								</xsl:otherwise>
							</xsl:choose>
						</td>
						<td><xsl:value-of select="qc"/></td>
						<td><xsl:value-of select="qsccal"/></td>
						<td><xsl:value-of select="sum"/></td>
					</tr>
				</xsl:for-each>
			</tbody>
		</table>
	</xsl:template>
	
<!-- QCI TABLE -->
	<xsl:template name="showqcitable">
		<table>
			<thead>
				<tr>
					<th>i</th>
					<th>y</th>
					<th>qc</th>
					<th>&#931;</th>
				</tr>
			</thead>
			<tbody>
				<xsl:for-each select="/root/calculation/qcitable/row">
					<tr>
						<td><xsl:value-of select="i"/></td>
						<td><xsl:value-of select="format-number(i * /root/dy, '0.00')"/></td>
						<td><xsl:value-of select="qc"/></td>
						<td><xsl:value-of select="sum"/></td>
					</tr>
				</xsl:for-each>
			</tbody>
		</table>
	</xsl:template>
	
<!-- QCII TABLE -->
	<xsl:template name="showqciitable">
		<table>
			<thead>
				<tr>
					<th>i</th>
					<th>y</th>
					<th>qc</th>
					<th>&#931;</th>
				</tr>
			</thead>
			<tbody>
				<xsl:for-each select="/root/calculation/qciitable/row">
					<tr>
						<td><xsl:value-of select="i"/></td>
						<td><xsl:value-of select="format-number(i * /root/dy, '0.00')"/></td>
						<td><xsl:value-of select="qc"/></td>
						<td><xsl:value-of select="sum"/></td>
					</tr>
				</xsl:for-each>
			</tbody>
		</table>
	</xsl:template>
	
<!-- QCIII TABLE -->
	<xsl:template name="showqciiitable">
		<table>
			<thead>
				<tr>
					<th>i</th>
					<th>y</th>
					<th>qc</th>
					<th>&#931;</th>
				</tr>
			</thead>
			<tbody>
				<xsl:for-each select="/root/calculation/qciiitable/row">
					<tr>
						<td><xsl:value-of select="i"/></td>
						<td><xsl:value-of select="format-number(i * /root/dy, '0.00')"/></td>
						<td><xsl:value-of select="qc"/></td>
						<td><xsl:value-of select="sum"/></td>
					</tr>
				</xsl:for-each>
			</tbody>
		</table>
	</xsl:template>


</xsl:stylesheet> 
