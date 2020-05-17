//****************************************
//INPUT BINDER OBJECT
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2020-04-05	Start

//****************************************
//Todo

//****************************************
//Dependencies

//****************************************

function InputBinder()
{
}

InputBinder.prototype.bindText=function(inputId, name)
{
	Object.defineProperty(this, name,
	{
		get()
		{
			return document.getElementById(inputId).value;
		},
		set(value)
		{
			document.getElementById(inputId).value=value;
		}
	});
}

InputBinder.prototype.bindInt=function(inputId, name)
{
	Object.defineProperty(this, name,
	{
		get()
		{
			return parseInt(document.getElementById(inputId).value);
		},
		set(value)
		{
			document.getElementById(inputId).value=value;
		}
	});
}

InputBinder.prototype.bindFloat=function(inputId, name)
{
	Object.defineProperty(this, name,
	{
		get()
		{
			return parseFloat(document.getElementById(inputId).value.replace(",", "."));
		},
		set(value)
		{
			document.getElementById(inputId).value=value.toString().replace(".", ",");
		}
	});
}
