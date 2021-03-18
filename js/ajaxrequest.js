(function(){

	//defining the constructor
	this.AjaxRequest = function(){

		//global element references
		window.ajaxContext = this;
		this.cookie = null;

		this.callback = [];
		this.callbackContext = [];
		this.xmlhttp = [];
		this.xmlhttpUsed = [];
		this.useCookiesState = true;
		this.objIndex = 0;

		//default options{
		var defaults = {
				asyncstat: true,
				resultType:'json',
				requestHeader: true	
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

		AjaxRequest.prototype.makeAjaxObject = function(){
			if(window.XMLHttpRequest){
				this.xmlhttp[this.objIndex] = new XMLHttpRequest();
			}else{
				//fix for older browsers
				this.xmlhttp[this.objIndex] = new ActiveXObject("Microsoft.XMLHTTP");
			}

			this.objIndex++;
			
			let index = this.xmlhttp.length - 1;
			this.xmlhttpUsed[index] = false;
			return index;
		}
		AjaxRequest.prototype.getAjaxObjectIndex = function(){
			for (let i = 0; i < this.xmlhttpUsed.length; i++) {
				if (this.xmlhttpUsed[i] == false) {
					return i;
				}
			}

			let index = this.makeAjaxObject();
			return index;
			
		}
		AjaxRequest.prototype.setResponse = function(type){
			this.options.resultType = type;

		}
		AjaxRequest.prototype.setUseCookies = function(value){
			this.useCookiesState = value;

		}
		AjaxRequest.prototype.setRequestHeader = function(type){
			this.options.requestHeader = false;

		}

		
		AjaxRequest.prototype.get = function(url, dataMap){
			let i = 0;ß
			let target = url;
			index = this.getAjaxObjectIndex();
			xmlhttp = this.xmlhttp[index];
			this.xmlhttpUsed[index] = true;

			for (const [key, element] of Object.entries(dataMap)) {
				if ($i === 0) {target += '?'}else{target += '&'};
				
				target += (key + '=' + element); 

				
				//console.log(target);
				$i++;
			}


			xmlhttp.open("GET", "demo_get2.asp?fname=Henry&lname=Ford", true);
			if(window.ajaxContext.useCookiesState){
				//xmlhttp.setRequestHeader("Cookie", document.cookie);
				xmlhttp.withCredentials = true;
			}

			xmlhttp.send();

			
			xmlhttp.send(data);
			
			if (callback !== null) {
				context.callback[index] = callback;
				context.callbackContext[index] = cbcontext;
			}else{
				context.callback[index] = context.donothing;
				context.callbackContext[index] = null;
			}
			waitForResponse.call(context, [index]);

		}

		AjaxRequest.prototype.request = function (target, data = null, options = null) {
			
			const callbackFunc = (options.callback != 'undefined') ? options.callback: null;
			const callbackFuncContext = (options.callbackContext != 'undefined') ?options.callbackContext: null;
			const progress = (options.progressCallback != 'undefined') ?options.progressCallback: null;

			this.post(target, callbackFunc, data, callbackFuncContext, progress);
		}

		//depreciated but dont remove, request() instead
		AjaxRequest.prototype.apiCall = function(target, callback = null , data = null, cbcontext = null, progress = null){
			console.log('target is = ' +target)
			let appkpp = window.dataServiceContext.getKpp();
			data.append('token', appkpp);
			
			return this.post(target, callback, data, cbcontext, progress);

		}



		AjaxRequest.prototype.postRequest = function (target, data = null, options = null) {
			const callbackFunc = (options.callback != 'undefined') ? options.callback: null;
			const callbackFuncContext = (options.callbackContext != 'undefined') ?options.callbackContext: null;
			const progress = (options.progressCallback != 'undefined') ?options.progressCallback: null;


			this.post(target, callbackFunc, data, callbackFuncContext, progress);
		}

		//depreciated but dont remove use postRequest instead
		AjaxRequest.prototype.post = function(target, callback = null , data = null, cbcontext = null, progress = null){
			//console.trace();
			//console.log('the target is - ' + target);
			let context = this;
	
			index = this.getAjaxObjectIndex();
			xmlhttp = this.xmlhttp[index];
			this.xmlhttpUsed[index] = true;

			
			makeRequest();


			//nested request function
			function makeRequest(){
				/*console.log('request details are as follows');
				console.log(target);
				for (var pair of data.entries()) {
					console.log(pair[0]+ ', ' + pair[1]); 
				}
				console.trace();
				*/

				xmlhttp.open("POST", target, context.options.asyncstat);
				if (context.options.requestHeader) {
					if (data instanceof FormData) {
						//do not set content-type request header for form data obj
					}else{
						xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					}
				}

				if(window.ajaxContext.useCookiesState){
					//xmlhttp.setRequestHeader("Cookie", document.cookie);
					xmlhttp.withCredentials = true;
					
				}
				xmlhttp.send(data);

				if (progress != null) {
					console.log('----- progress ----- ')
					xmlhttp.upload.addEventListener('progress', function(e){
						const progressData = {
							precent: Math.ceil(e.loaded/e.total) * 100,
							done: e.loaded,
							total: e.total
						};
						console.log(progressData)
						if (callbackContext === null) progress(progressData);
						else progress.apply(cbcontext, progressData);
						
					}, false);
					
				}else{
					console.log('no progress working')
				}
				
				if (callback !== null) {
					context.callback[index] = callback;
					context.callbackContext[index] = cbcontext;
				}else{
					context.callback[index] = context.donothing;
					context.callbackContext[index] = null;
				}
				waitForResponse.call(context, [index]);
			}

			return index;
			
		}
		

		

		function waitForResponse(index){
			var context = this;
			let result = null;
			//TODO: return error if target is unreachable
			//use context reference because of onreadystatechange state
			context.xmlhttp[index].onreadystatechange = function() {
		
				  if (this.readyState == 4 && this.status == 200) {
					  console.log(this.responseText);
				  	result = (context.options.resultType == 'xml') ?
						this.responseXML : (context.options.resultType == 'json')?
							JSON.parse(this.responseText):
							this.responseText;	
					
					result['i'] = index;
					
					
				 	if (context.callbackContext[index] === null) {
						 context.callback[index](result);
				 	}else{
						 //not that for results with context the result comes in an array
						
						let arr = [result];
				 		context.callback[index].apply(context.callbackContext[index], arr);
				 	}


					context.xmlhttpUsed[index] = false;
				  }
				}
			}

		AjaxRequest.prototype.donothing = function(target){
			//console.log('request is doing nothing');
		}

}());