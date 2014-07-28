
/****************************************************************************************\
|*	Artist: Rendell Pierre																*|
|*	Artwork's Name: JTIMER																*|
|*  Version: v1.0																		*|
|*	Artwork's Description: A fully changeable and elegant timer that anybody can use.	*|
|*	                     Plus it's responsive and plays well with bootstrap. 			*|
|*	                     And...It's Open Source.							 			*|
\****************************************************************************************/

/**************** Global Namespace Object *************/

var JTIMER = JTIMER || {};

/***************** Ticker Type Enum Object*************/

JTIMER.TickerType = Object.freeze({
						DAY: "dayTicker",
						HOUR: "hourTicker",
						MINUTE: "minuteTicker",
						SECOND: "secondTicker"
					});

/********************** Timer Object ******************/

JTIMER.Timer = function(element, timerType, targetDate){
	
	//Properties
    this.element = element;
	this.interval = null;
	this.isTicking = true;
	this.timerType = timerType;
	
	this.targetDate = targetDate;
	this.remainingTime = JTIMER.Helper.prototype.getRemainingTime(this.targetDate);
	
	this.dayTicker = new JTIMER.Ticker(this, JTIMER.TickerType.DAY);
	this.hourTicker = new JTIMER.Ticker(this, JTIMER.TickerType.HOUR);
	this.minuteTicker = new JTIMER.Ticker(this, JTIMER.TickerType.MINUTE);
	this.secondTicker = new JTIMER.Ticker(this, JTIMER.TickerType.SECOND);

	this.tickerStyle = new JTIMER.TickerStyle();
	this.dayTickerStyle = new JTIMER.DayTickerStyle();
	this.hourTickerStyle = new JTIMER.HourTickerStyle();
	this.minuteTickerStyle = new JTIMER.MinuteTickerStyle();
	this.secondTickerStyle = new JTIMER.SecondTickerStyle();
	
	this.init();
};

//Methods

JTIMER.Timer.prototype.init = function() {
	myTimer = this;
	this.interval = setInterval(function(){myTimer.loop()}, 10);
}

JTIMER.Timer.prototype.loop = function() {
	//timer will update, check to see if its not 0 time remaining and render
	this.update();
	this.checkIfOver();
    this.render();
}

JTIMER.Timer.prototype.update = function() {
	//get the new remaining time
    this.remainingTime = JTIMER.Helper.prototype.getRemainingTime(this.targetDate);
}

JTIMER.Timer.prototype.render = function() {
	//render all the tickers
	this.dayTicker.render(this.remainingTime);
	this.hourTicker.render(this.remainingTime);
	this.minuteTicker.render(this.remainingTime);
	this.secondTicker.render(this.remainingTime);
}

JTIMER.Timer.prototype.checkIfOver = function() {
	//once the timer reaches somewhere around 0 it is considered done
	if (this.remainingTime < 0.1) {
		this.isTicking = false;
	};
}

/********************** Ticker Object ******************/

JTIMER.Ticker = function(timer, tickerType){
	
	//properties
    this.timer = timer;
    this.tickerType = tickerType;
    this.element = tickerType;
    this.progressShape = new JTIMER.ProgressShape(this, this.timer.timerType);
};

//methods
JTIMER.Ticker.prototype.render = function(content) {
	//content is the time in milliseconds

	//this is to div and mod the remaining time to help display the right amount of days, hours, minutes and seconds
	denominator = 60;

	//label is the text behind the number in the ticket(Days, Hours, Minutes, Seconds)
	//Can't think of a better name :(
	label = "";

	//this is the display the right stuff for the individual tickers
	switch (this.tickerType){
		case JTIMER.TickerType.DAY:
			content = (JTIMER.Helper.prototype.splitDate(content)).days;
			label = "DAYS";
			denominator = 365;
		break;

		case JTIMER.TickerType.HOUR:
			content = (JTIMER.Helper.prototype.splitDate(content)).hours;
			label = "HOURS";
			denominator = 24;
		break;

		case JTIMER.TickerType.MINUTE:
			content = (JTIMER.Helper.prototype.splitDate(content)).minutes;
			label = "MINS";
			denominator = 60;
		break;

		case JTIMER.TickerType.SECOND:
			content = (JTIMER.Helper.prototype.splitDate(content)).seconds;
			label = "SECS";
			denominator = 60;
		break;

		default:
			content = 0;
		break;
	} 

	//render the progress of the ticker
	this.progressShape.render(content, label, Math.round((content/denominator)*100));
};  
/********************** ProgressShape Object ******************/

JTIMER.ProgressShape = function(ticker, timerType){

	//properties 
	this.ticker = ticker; 
	this.timerType = timerType;
	this.startPoint = 1.5;
	this.tickerStyle = new JTIMER.TickerStyle();
	this.firstRender = true;

    this.init();

}; 

//methods
JTIMER.ProgressShape.prototype.init = function() {
	//add the canvas to the ticker <div> element
	document.getElementById(this.ticker.element).innerHTML = "<canvas width='720' height='720' class='canvas' id='" + this.ticker.tickerType + "Canvas'></canvas>";
	
	//reference the canvas
	this.canvas = document.getElementById(this.ticker.tickerType + "Canvas");

	//get its 2d context
	this.canvasContext = this.canvas.getContext("2d");
}; 

JTIMER.ProgressShape.prototype.render = function(number, label, percentage) {
	//clear the canvas
	this.canvasContext.clearRect(0,0,this.canvas.width,this.canvas.height);
	
	//initiate the ticker style
	this.initStyles();

	//to run the right render logic
	switch (this.timerType){
		case "Circular":
			this.circularRender(number, label, percentage);
		break;

		case "Box":
			this.boxRender(number, label, percentage);
		break;

		case "Bar":
			this.barRender(number, label, percentage);
		break;

		case "Line":
			this.lineRender(number, label, percentage);
		break;

		default:
			this.circularRender(number, label, percentage);
		break;
	}
};


JTIMER.ProgressShape.prototype.circularRender = function(number, label, percentage) {
	//get the right radius so we dont draw piece of the circle off the canvas
	radius = this.tickerStyle.progressWidth;
	if(this.tickerStyle.progressWidth > this.tickerStyle.progressBackgroundWidth)
		radius = ((this.canvas.width/2) - (this.tickerStyle.margin)) - this.tickerStyle.progressWidth/2;
	else
		radius = ((this.canvas.width/2) - (this.tickerStyle.margin)) - this.tickerStyle.progressBackgroundWidth/2;
	
	//draw the background
	this.canvasContext.beginPath();
	this.canvasContext.arc(this.canvas.width/2, this.canvas.height/2, radius - (this.tickerStyle.progressBackgroundWidth/2), 0, 2*Math.PI);
	this.canvasContext.fillStyle = this.tickerStyle.backgroundColor;
	this.canvasContext.fill();
	
	//draw the progress background
	this.canvasContext.beginPath();
	this.canvasContext.arc(this.canvas.width/2, this.canvas.height/2, radius, 0, 2*Math.PI);
	this.canvasContext.strokeStyle = this.tickerStyle.progressBackgroundColor;
	this.canvasContext.lineWidth = this.tickerStyle.progressBackgroundWidth;
	this.canvasContext.stroke();

	//draw the actual progress
	this.canvasContext.beginPath();
	this.canvasContext.arc(this.canvas.width/2, this.canvas.height/2, radius, this.startPoint*Math.PI, (this.startPoint - (2*(percentage/100)))*Math.PI, true);
	this.canvasContext.strokeStyle = this.tickerStyle.progressColor;
	this.canvasContext.lineWidth = this.tickerStyle.progressWidth; 
	this.canvasContext.stroke(); 

	//draw the text
	this.renderText(number, label, percentage);
};  

JTIMER.ProgressShape.prototype.boxRender = function(number, label, percentage) {  
	//set the properties
	this.canvasContext.strokeStyle = this.tickerStyle.progressBackgroundColor;
	this.canvasContext.lineWidth = this.tickerStyle.progressBackgroundWidth;
	this.canvasContext.fillStyle = this.tickerStyle.backgroundColor;
	
	//draw the progress background
	this.canvasContext.strokeRect(this.tickerStyle.margin, 
		this.tickerStyle.margin, 
		this.canvas.width - this.tickerStyle.margin, 
		this.canvas.height - this.tickerStyle.margin);

	//draw the background
	this.canvasContext.fillRect(this.tickerStyle.margin + this.tickerStyle.progressBackgroundWidth/2, 
		this.tickerStyle.margin + this.tickerStyle.progressBackgroundWidth/2, 
		((this.canvas.width - this.tickerStyle.margin) - this.tickerStyle.progressBackgroundWidth), 
		((this.canvas.height - this.tickerStyle.margin) - this.tickerStyle.progressBackgroundWidth));

	//draw the actual progress
	this.canvasContext.beginPath(); 
	this.canvasContext.strokeStyle = this.tickerStyle.progressColor;
	this.canvasContext.lineWidth = this.tickerStyle.progressWidth;
	this.canvasContext.moveTo(this.canvas.width / 2, this.tickerStyle.margin);


	//five lines in total to make up the 100% percentage
	//first and last one is 12.5% and the 2nd to the 4th is 25%
	
	//get the first line coordinates
	coord = this.getCoords(percentage, 1);

	i = 2;
	//get all the other lines up the the right percantage
	while(coord != null){
		this.canvasContext.lineTo(coord.x,coord.y);
		coord = this.getCoords(percentage, i);
		i++;
	}

	//draw all the lines
	this.canvasContext.lineWidth = this.tickerStyle.progressWidth; 
	this.canvasContext.strokeStyle = this.tickerStyle.progressColor; 
	this.canvasContext.stroke();

	//draw the text
	this.renderText(number, label, percentage);
};  

JTIMER.ProgressShape.prototype.barRender = function(number, label, percentage) { 
	//draw the bar background
	this.canvasContext.beginPath();
	this.canvasContext.strokeStyle = this.tickerStyle.progressBackgroundColor;
	this.canvasContext.lineWidth = this.tickerStyle.progressBackgroundWidth;
	this.canvasContext.fillStyle = this.tickerStyle.progressBackgroundColor;
	this.canvasContext.fillRect(
		this.tickerStyle.margin, 
		this.tickerStyle.margin, 
		(this.canvas.width - this.tickerStyle.margin), 
		(this.canvas.height - this.tickerStyle.margin)
	);

	//draw the progess bar at the right height
	this.canvasContext.beginPath();
	this.canvasContext.strokeStyle = this.tickerStyle.progressColor;
	this.canvasContext.lineWidth = this.tickerStyle.progressWidth;
	this.canvasContext.fillStyle = this.tickerStyle.progressColor;
	this.canvasContext.fillRect(
		this.tickerStyle.margin, 
		(this.canvas.height - this.tickerStyle.margin) - ((percentage/100) * ((this.canvas.width - this.tickerStyle.margin) - this.tickerStyle.margin)), 
		(this.canvas.width - this.tickerStyle.margin), 
		(this.canvas.height - this.tickerStyle.margin)
	);

	//draw the text
	this.renderText(number, label, percentage);
};  

JTIMER.ProgressShape.prototype.lineRender = function(number, label, percentage) { 
	//draw the background
	this.canvasContext.beginPath();
	this.canvasContext.lineWidth = this.tickerStyle.progressBackgroundWidth;
	this.canvasContext.fillStyle = this.tickerStyle.backgroundColor;
	this.canvasContext.fillRect(this.tickerStyle.margin + this.tickerStyle.progressBackgroundWidth/2, 
		this.tickerStyle.margin + this.tickerStyle.progressBackgroundWidth/2, 
		((this.canvas.width - this.tickerStyle.margin) - this.tickerStyle.progressBackgroundWidth), 
		((this.canvas.height - this.tickerStyle.margin) - this.tickerStyle.progressBackgroundWidth));

	//definite the left border
	this.canvasContext.beginPath();
	this.canvasContext.strokeStyle = this.tickerStyle.progressColor;
	this.canvasContext.lineWidth = this.progressWidth;
	this.canvasContext.moveTo(this.tickerStyle.margin, this.tickerStyle.margin);
	this.canvasContext.lineTo(this.tickerStyle.margin, this.canvas.height - this.tickerStyle.margin);

	//definite the right border
	this.canvasContext.moveTo(this.canvas.width - this.tickerStyle.margin, this.tickerStyle.margin);
	this.canvasContext.lineTo(this.canvas.width - this.tickerStyle.margin, this.canvas.height - this.tickerStyle.margin);

	this.canvasContext.lineWidth = this.tickerStyle.progressWidth; 
	this.canvasContext.strokeStyle = this.tickerStyle.progressColor; 

	//draw the borders
	this.canvasContext.stroke();

	//draw the text
	this.renderText(number, label, percentage);
};  

JTIMER.ProgressShape.prototype.renderText = function(number, label, percentage) { 
	//shadow for behind the text
	this.canvasContext.shadowBlur=30;
	this.canvasContext.shadowColor="rgba(0,0,0,0.5)"; 

	//text properties
	this.canvasContext.font = this.tickerStyle.fontSize + " " + this.tickerStyle.font;
	this.canvasContext.fillStyle = this.tickerStyle.fontColor;
	this.canvasContext.fillText(number + " " + label, (this.canvas.width - this.canvasContext.measureText(number + " " + label).width)/2, this.canvas.height/2); 
	
	//reset the shadow to prevent it from giving every thing shadows
	this.canvasContext.shadowBlur = 0;
	this.canvasContext.shadowColor = "rgba(0,0,0,0)"; 

};  

JTIMER.ProgressShape.prototype.getCoords = function(percentage, lineSector) { 

	//get the coordinates for each line that makes up the box progress
	if (lineSector == 1) 
		//the first line represnts 12.5%
		//so if the percentage is more than 12.5% I just draw the entire line
		//else I find how much percent of the line I should draw and draw just that amount
		//same concept for the 2nd, 3rd, 4th and 5th lines
		if(percentage > 12.5){
			return {x: this.tickerStyle.margin, y: this.tickerStyle.margin};
		}else{
			remainingPercent = percentage; 
			remainingPercent /= 12.5;  
			width = (this.canvas.width /2) - this.tickerStyle.margin;
			pointX = (this.canvas.width /2) - (width * remainingPercent);
			return {x: pointX, y: this.tickerStyle.margin};
		}

	if (lineSector == 2)
		//the second line represnts 25%
		//so if the percentage is more the first line plus the second one (which is than 12.5% + 25% = 37.5) I just draw the entire line
		//and blah blah blah. I think thats enough info
		if(percentage > 37.5){
			return {x: this.tickerStyle.margin, y: this.canvas.height - this.tickerStyle.margin};
		}else if((percentage >= 12.5) && (percentage < 37.5)){
			remainingPercent = percentage - 12.5; 
			remainingPercent /= 25;  
			height = (this.canvas.height - this.tickerStyle.margin) - this.tickerStyle.margin;
			pointY = (this.tickerStyle.margin) + (height * remainingPercent);
			return {x: this.tickerStyle.margin, y: pointY};
		}

	if (lineSector == 3) { 
		//same thing here
		//the third line represnts 25%
		//so 12.5% + 25% + 25% = 62.5)
		if(percentage > 62.5){
			return {x: this.canvas.width - this.tickerStyle.margin, y: this.canvas.height - this.tickerStyle.margin};
		}else if((percentage >= 37.5) && (percentage < 62.5)){
			remainingPercent = percentage - 37.5; 
			remainingPercent /= 25;  
			width = (this.canvas.width - this.tickerStyle.margin) - this.tickerStyle.margin;
			pointX = (this.tickerStyle.margin) + (width * remainingPercent);
			return {x: pointX, y: this.canvas.height - this.tickerStyle.margin};
		}
	}
	if (lineSector == 4) 
		//same thing here
		if(percentage > 87.5){
			return {x: this.canvas.width - this.tickerStyle.margin, y: this.tickerStyle.margin};
		}else if((percentage >= 62.5) && (percentage < 87.5)){
			remainingPercent = percentage - 62.5; 
			remainingPercent /= 25;
			height = (this.canvas.height - this.tickerStyle.margin) - this.tickerStyle.margin;
			pointY = (this.canvas.height - this.tickerStyle.margin) - (height * remainingPercent);
			return {x: this.canvas.width - this.tickerStyle.margin, y: pointY};
		}

	if (lineSector == 5)
		//same thing here as well
		if(this.percent > 99){
			return {x: this.canvas.width / 2, y: this.tickerStyle.margin};
		} else if((percentage >= 87.5) && (percentage < 99)){
			remainingPercent = percentage - 87.5; 
			remainingPercent /= 12.5;
			width =  (this.canvas.width - this.tickerStyle.margin) - (this.canvas.width /2);
			pointX = (this.canvas.width/2) + (width - (width * remainingPercent));
			return {x: pointX, y: this.tickerStyle.margin};
		}

	//return null if the percentage does not reach that line
	return null;
};  

JTIMER.ProgressShape.prototype.initStyles = function() {
	//create a null object
	tStyle = null;

	//assign the correct style to the specific ticker style
	switch (this.ticker.tickerType){
		case JTIMER.TickerType.DAY:
			tStyle = this.ticker.timer.dayTickerStyle;
		break;

		case JTIMER.TickerType.HOUR:
			tStyle = this.ticker.timer.hourTickerStyle;
		break;

		case JTIMER.TickerType.MINUTE:
			tStyle = this.ticker.timer.minuteTickerStyle;
		break;

		case JTIMER.TickerType.SECOND:
			tStyle = this.ticker.timer.secondTickerStyle;
		break;

		default:
			tStyle = new JTIMER.TickerStyle();
		break;
	}

	//check to see if the specific style is null. if null then this means that the style was not changed by the user so style falls back to the general ticker style
	if(tStyle.margin == null)
		this.tickerStyle.margin = this.ticker.timer.tickerStyle.margin;

	if(tStyle.backgroundColor == null)
		this.tickerStyle.backgroundColor = this.ticker.timer.tickerStyle.backgroundColor;

	if(tStyle.font == null)
		this.tickerStyle.font = this.ticker.timer.tickerStyle.font;

	if(tStyle.fontColor == null)
		this.tickerStyle.fontColor = this.ticker.timer.tickerStyle.fontColor;

	if(tStyle.fontSize == null)
		this.tickerStyle.fontSize = this.ticker.timer.tickerStyle.fontSize;

	if(tStyle.progressColor == null)
		this.tickerStyle.progressColor = this.ticker.timer.tickerStyle.progressColor;

	if(tStyle.progressWidth == null)
		this.tickerStyle.progressWidth = this.ticker.timer.tickerStyle.progressWidth;

	if(tStyle.progressBackgroundColor == null)
		this.tickerStyle.progressBackgroundColor = this.ticker.timer.tickerStyle.progressBackgroundColor;

	if(tStyle.progressBackgroundWidth == null)
		this.tickerStyle.progressBackgroundWidth = this.ticker.timer.tickerStyle.progressBackgroundWidth;   

	//assign the style to the general day|hour|minute|second ticker
	switch (this.ticker.tickerType){
		case JTIMER.TickerType.DAY:
			this.ticker.timer.dayTickerStyle = tStyle; 
		break;

		case JTIMER.TickerType.HOUR:
			this.ticker.timer.hourTickerStyle = tStyle; 
		break;

		case JTIMER.TickerType.MINUTE:
			this.ticker.timer.minuteTickerStyle = tStyle; 
		break;

		case JTIMER.TickerType.SECOND:
			this.ticker.timer.secondTickerStyle = tStyle; 
		break;

		default:
		break;
	} 

	//assign the new style
	this.tickerStyle = tStyle;
};

/********************** Ticker Style Object ******************/

JTIMER.TickerStyle = function() {

	//properties
	this.margin = 5;
    this.backgroundColor = "rgba(0,0,0,0)";
	
    this.font = "Arial";
    this.fontColor = "rgba(255,255,255,1)";
    this.fontSize = "100px";

    this.progressColor = "rgba(255,255,255,1)";
    this.progressWidth = 50;

    this.progressBackgroundColor = "rgba(0,0,0,0.1)";
    this.progressBackgroundWidth = 50;
};

/********************** Day Ticker Style Object ******************/

JTIMER.DayTickerStyle = function() {

	//properties
    this.margin = null;
    this.backgroundColor = null;
	
    this.font = null;
    this.fontColor = null;
    this.fontSize = null;
	
    this.progressColor = null;
    this.progressWidth = null;
    
    this.progressBackgroundColor = null;
    this.progressBackgroundWidth = null;
};

/********************** Hour Ticker Style Object ******************/

JTIMER.HourTickerStyle = function() {

	//properties
    this.margin = null;
    this.backgroundColor = null;
	
    this.font = null;
    this.fontColor = null;
    this.fontSize = null;
	
    this.progressColor = null;
    this.progressWidth = null;
    
    this.progressBackgroundColor = null;
    this.progressBackgroundWidth = null;
};

/********************** Minute Ticker Style Object ******************/

JTIMER.MinuteTickerStyle = function() {

	//properties
    this.margin = null;
    this.backgroundColor = null;
	
    this.font = null;
    this.fontColor = null;
    this.fontSize = null;
	
    this.progressColor = null;
    this.progressWidth = null;
    
    this.progressBackgroundColor = null;
    this.progressBackgroundWidth = null;
};

/********************** Second Ticker Style Object ******************/

JTIMER.SecondTickerStyle = function() {

	//properties
    this.margin = null;
    this.backgroundColor = null;
	
    this.font = null;
    this.fontColor = null;
    this.fontSize = null;
	
    this.progressColor = null;
    this.progressWidth = null;
    
    this.progressBackgroundColor = null;
    this.progressBackgroundWidth = null;
};

/********************** Helper Object ******************/

JTIMER.Helper = function() {
    
};
//methods
JTIMER.Helper.prototype.getRemainingTime = function(targetDate) {
	//get the ecurrent day
	now = new Date();

	//get the time it will take the reach the target date in milliseconds
	milliseconds = targetDate - now; 

	//if the remaining time is less than 0.1 and going into the negative seconds then put it back to 0 
	if (milliseconds/1000 < 0.1)
		milliseconds  = 0;

	return milliseconds;
}

JTIMER.Helper.prototype.splitDate = function(milliseconds) {
	//div and mod to split up the date into days and hours, minutes and seconds
	d = milliseconds/86400000;
	milliseconds %= 86400000;
	h = milliseconds/3600000;
	milliseconds %= 3600000;
	m = milliseconds/60000;
	milliseconds %= 60000;
	s = milliseconds/1000;

	return {days:Math.floor(d), hours:Math.floor(h), minutes:Math.floor(m), seconds:Math.floor(s)};
};