//****************************************
//XML TREE OBJECT
//****************************************
//Copyright: Major, Balazs
//E-mail: majorstructures@gmail.com
//****************************************
//Change history
//2020-05-16	Start

//****************************************
//Todo

//****************************************
//Dependencies

//****************************************

function XmlTree(rootNodeTag)
//rootNodeTag: the tag name of the root node (string)
{
	var doc=document.implementation.createDocument("", rootNodeTag, null);
	Object.setPrototypeOf(doc, Object.create(XmlTree.prototype));
	return doc;
}

XmlTree.prototype = Object.create(XMLDocument.prototype);
XmlTree.prototype.constructor = XmlTree;

XmlTree.prototype.add=function(name, value)
{
	var newNode;
	if(this.ownerDocument==null)
	{
		newNode=this.createElement(name);
		this.firstChild.appendChild(newNode);
	}
	else
	{
		newNode=this.ownerDocument.createElement(name);
		this.appendChild(newNode);
	}
	if(value!=undefined)
	{
		newNode.textContent=value;
	}
	newNode.add=XmlTree.prototype.add;
	return newNode;
};

XmlTree.prototype.toString=function()
{
	var serializer = new XMLSerializer();
	return serializer.serializeToString(this);
};
