(function(){
	//alert('hello');

	//defining the cookie constructor
	this.Cookie1 = function(){

		//global element references
		window.cookieBarContext = this;
		this.cookie = null;
		this.message = null;
		this.overlay = null;
		this.closeCookieButton = null;
		this.action1 = null;
		this.action2 = null;
		this.cookieState = false;
		this.spinnerId = 'jaosdf';
		this.alertTime = 3;
		this.trueAction = null;
		this.falseAction = null;
		this.closeCookieTimeout = null;

		//default options{
		var defaults = {
				content: "hello",
				closeCookieBtn: true,
				className: 'class',
				flypass: false,
				duration: 3,
				type: 'spinner',
				message: 'Hi please do enjoy your time on our website this was added to increase the length of the message',
				actions: 1,
				opt1String: "OK",
				opt2String: "Cancel",
			}

		//create options by extending defaults with the passed arguments
		//alert('over the arguments');
		//if (arguments[0] && typeof arguments[0] === 'object') {
			//alert('these are the options running now');
			this.options = extendDefaults(defaults, arguments[0]);
		//}
	}
		//utility method to extend defaults
		function extendDefaults(source, properties){
			var property;
			for (property in properties){
				if (properties.hasOwnProperty(property)) {
					source[property] = properties[property];
				}
			}
			return source;
		}
		function initializeEvents(){
			if (this.closeCookieButton) {
				this.closeCookieButton.addEventListener('click', this.closeCookie.bind(this));
			}
			if (this.options.actions >= 1 && this.options.type !== "spinner") {
				this.action1.addEventListener('click', this.accept.bind(this));
			}if (this.options.actions >= 1 && this.options.type !== "spinner") {
				if (this.action2 != null) {
					this.action2.addEventListener('click', this.decline.bind(this));
				}
				
			}
		}
		function generatesId(){
			var id = 'cook1_spinner_' + Date.now();
			return id;
		}
		function buildOut(){

				if (this.cookieState === true) {
					this.remove.call(this);
				}

				//cheking if content is a html string or a domNode
				if (typeof this.options.content === "string") {
					content = this.options.content;
				}else{
					content = this.options.content.innerHTML
				}

				//cheking how many actions thsts r possible in this cookie
				if (this.options.actions === 1) {
					classExtention = "cookie1_opt_1opt";
				}else if (this.options.actions >= 2) {
					classExtention = "cookie1_opt_2opt";
				}else{
					classExtention = "cookie1_opt_noopt";
				}


				//creating the document DocumentFragment to build with
				docFrag = document.createDocumentFragment();

				//creating the cookie element
				this.cookie = document.createElement("div");
				this.cookie.className = "cookie1" + " " +classExtention + " cookieopen1";



				//adding closeCookiebtn if closeCookiebtn if closeCookiebutton is set to true
				if (this.options.closeCookieBtn === true) {
					this.closeCookieButton = document.createElement("button");
					this.closeCookieButton.className = "cookie1_xbtn xSign cookie1_cntcont";
					this.closeCookieButton.innerHTML = "X";

					//this appends the s shaped divs instead 0f using the 'x' divs give greater flextibility
					closeCookiexcomponent1 = document.createElement("div");
					closeCookiexcomponent1.className = "xcomp x1";

					closeCookiexcomponent2 = document.createElement("div");
					closeCookiexcomponent2.className = "xcomp x2";

					this.closeCookieButton.appendChild(closeCookiexcomponent1);
					this.closeCookieButton.appendChild(closeCookiexcomponent2);

					//adding the closeCookiebutton to the cookie #box
					this.cookie.appendChild(this.closeCookieButton);
					//alert('i just appended the closeCookie button');


				}

				//creating the cookie message
				if (this.options.message != null) {

					//this statement determines the color and type of message
					if (this.options.type === 'red') {
						classString = "cookie1_msg cookie1_cntcont";
					}else{
						classString = "cookie1_msg cookie1_cntcont";
					}

					//creating the message element
					this.message = document.createElement('div');
					this.message.className = classString;
					this.message.innerHTML = this.options.message;

					//appending the message to the cookie
					this.cookie.appendChild(this.message);
					//alert('i just appended the message');
				}


				//creating the second action if requested for
				if (this.options.actions > 1 && this.options.type !== "spinner") {
					this.action2 = document.createElement('div');
					this.action2.className = "cookie1_action t-color1 cookie1_cntcont";
					this.action2.innerHTML = this.options.opt2String;

					//appending this doc object to the document
					this.cookie.appendChild(this.action2);
					//alert('i just appended the action button');
				}


				//creating the first action button if requested for
				if (this.options.actions >= 1 && this.options.type !== "spinner") {
					this.action1 = document.createElement('div');
					this.action1.className = "cookie1_action t-color1 cookie1_cntcont";
					this.action1.innerHTML = this.options.opt1String;

					//appending this doc object to the document
					this.cookie.appendChild(this.action1);
					//alert('i just appended the action button');
				}

				//checking if this needs a progress bar
				//alert('oh to of it');
				if (this.options.type === "spinner") {
					this.action1 = document.createElement('div');
					this.action1.className = "cookie1_action t-color1 cookie1_cntcont cookie1_spinner_cont";
					this.action1.innerHTML = 'DONE';

					//creating the canvas element
					var c = document.createElement("canvas");
					c.className = 'cookie1_progressCir';
					this.spinnerId = generatesId();
					c.width = 30;
					c.height = 30;
					c.id = this.spinnerId;

					this.action1.appendChild(c);

					this.cookie.appendChild(this.action1);
				}


				//adding an overlay to the cookie background if neccesary
				if (this.overlay === true) {
					contentHolder = document.createElement('div');
					contentHolder.className = 'className';
					contentHolder.innerHTML = 'content';
					this.cookie.appendChild(contentHolder);
				}

				//appending the cookie to the docFrag
				docFrag.appendChild(this.cookie);

				//adding the cookie to the document
				document.body.appendChild(docFrag);

				this.cookieState = true;

				if (this.options.flypass === true) {
					var context = this;
					var duration = this.options.duration * 1000;
					//context was passed here to change the context from the window to the object
					setTimeout(function(){context.closeCookie(context);}, duration);
				}
		}

		

		function destroyPrevious(){


			if (this.cookieState === true) {
				closeCookie.call(this);
			}
		}

		function drawSpinner(id){
			var c = document.getElementById(id);
			var ctx = c.getContext("2d");
			ctx.beginPath();
			ctx.strokeStyle = "#ff0";
			ctx.lineWidth = 3;
			ctx.lineCap = 'round';
			ctx.arc(15, 15, 10, 0, 1 * Math.PI, true);
			ctx.stroke();
			//alert('yap');
			return c;
		}


		Cookie1.prototype.remove = function(){
			let parent = this.cookie.parentNode;
			parent.removeChild(this.cookie);
			this.cookieState = false;
			
		
		}
		Cookie1.prototype.accept = function(){
			this.closeCookie(true);
			if (this.trueAction !== null) {
				this.trueAction();
			}
			this.clearCallbacks();
		}
		Cookie1.prototype.decline = function(){
			this.closeCookie(true);
			if (this.trueAction !== null) {
				this.falseAction();
			}
			this.clearCallbacks();
		}
		 Cookie1.prototype.clearCallbacks = function () {
		 	this.trueAction = null;
		 	this.falseAction = null;
		 }


		Cookie1.prototype.progressDone = function(duration = 5){
			this.action1.className = this.action1.className.replace(" cookie1_spinner_cont", " cookie1_spinner_done");

			this.closeCookieTimeout =  setTimeout(this.closeCookie, duration * 1000);

		}

		//public methods
		Cookie1.prototype.open = function(){
			if(this.closeCookieTimeout !== null){
				clearTimeout(this.closeCookieTimeout);
				this.closeCookieTimeout = null;
			} 
			//open code goes here
			
			//Build out the cookie
			buildOut.call(this);

			//initialize the event listeners
			initializeEvents.call(this);

			 /*
		     * After adding elements to the DOM, use getComputedStyle
		     * to force the browser to recalc and recognize the elements
		     * that we just added. This is so that CSS animation has a start point
		     */
		     window.getComputedStyle(this.cookie).height;

		     if (this.options.type === "spinner") {
		     	drawSpinner(this.spinnerId);
		     }
		}

		
		Cookie1.prototype.alert = function(string, error = false){
			//alert(this);
			//alert(this.options);
			this.options.message = string;
			this.options.actions = 1;
			this.options.opt1String = "Got It";
			this.options.type = "normal";
			this.open();
			//setTimeout(this.closeCookie(), 3000);
		}
		Cookie1.prototype.show = function(string){
			this.options.message = string;
			this.options.actions = 0;
			this.options.flypass = true;
			this.options.duration = 7;
			this.options.type = "normal";
			this.open();
		}
		Cookie1.prototype.progress = function(string){
			this.options.message = string;
			this.options.actions = 1;
			this.options.flypass = false;
			this.options.duration = 3;
			this.options.type = "spinner";
			this.open();
		}

		Cookie1.prototype.hotSwap = function(string){
			this.message.innerHTML = string;
		}

		//not tested
		Cookie1.prototype.dialogue = function(string, truefunc, falsefunc, options = false){
			if (options !== false) {
				if (options.hasOwnProperty('trueOptionString')) {
					this.options.opt1String = options.trueOptionString;
				}
				if (options.hasOwnProperty('falseOptionString')) {
					this.options.opt2String = options.falseOptionString;
				}
			}
			this.options.message = string;
			this.options.actions = 2;
			this.options.flypass = false;
			this.options.duration = 3;
			this.options.type = "normal";
			if (truefunc !== 'undefined') {
				this.trueAction = truefunc;
			}
			if (falsefunc !== 'undefined') {
				this.falseAction = falsefunc;
			}
			this.open();
		}

		Cookie1.prototype.closeCookie = function(instant = false){

			var context = window.cookieBarContext;
			if(this.closeCookieTimeout !== null){
				clearTimeout(this.closeCookieTimeout);
				this.closeCookieTimeout = null;
			} 
			//alert(context);

				if(!instant){
					// remove the open class name
				context.cookie.className = context.cookie.className.replace(" cookieopen1", " cookiecloseCookie1");

				/* Listen for the CSS transitionend event and 
				* remove the nodes form the Dom
				*/

				context.cookie.addEventListener('animationend', function(){
					let parent = context.cookie.parentNode
					if(parent) parent.removeChild(context.cookie);
				});
			}else{
				let parent = context.cookie.parentNode
				if(parent) parent.removeChild(context.cookie);
			}

			context.cookieState = false;
		}

}())