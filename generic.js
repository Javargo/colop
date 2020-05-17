//****************************************
//GENERIC FUNCTIONS
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2020-05-03	Start

//****************************************
//Todo

//****************************************
//Dependencies

//****************************************

function loadXMLFileSync(filename)
{
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", filename, false);
	xhttp.send("");
	return xhttp.responseXML;
}
//=======================================================================

function loadXMLFileAsync(filePath, resultName, further)
{
	var request = new XMLHttpRequest();
	request.open("GET", filePath, true);
	request.onload = function (e)
	{
		if (request.readyState === 4)
		{
			if (request.status === 200)
			{
				further(request.responseXML);
			}
			else
			{
				throw "\nXMLHttpRequest error: "+request.statusText+"\n";
			}
		}
	};
	request.onerror = function (e)
	{
		throw "\nXMLHttpRequest error: "+request.statusText+"\n";
	};
	request.send();
}
