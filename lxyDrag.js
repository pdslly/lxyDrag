;(function(root){
"use strict";
const defaultOption = {
	count: 6,
	el: null,
	fileSize: 2,
	fileType: "jpeg|png|bmp",
	showTip: true,
	_appendedCount: 0,
	_appendedNums: 0,
	_cName:null,
}

function mixin(depth, target, source){
	let tar, src, args, len,
		i = 0;
	if(typeof depth !== "boolean"){
		args = [].slice.call(arguments);
		depth = false;
	}else{
		args = [].slice.call(arguments, 1);
	}
	if( (len = args.length) > 1 ){
		tar = args[0];
		i++;
	}else{
		throw new Error("arguments incorrect!")
	}
	for(; i < len; i++){
		if(tar === args[i]) continue;
		Object.getOwnPropertyNames(args[i]).forEach(function(name){
			let src = args[i][name];
			if(depth && typeof src === "object") src = mixin(true, src.length?[]:{}, src);
			tar[name] = src;
		});
	}
	return tar;
}

let lxyDrag = function(option){
	this.$option = mixin(defaultOption, option);
	this.loadCss(this.getCurrAbsPath);
};
lxyDrag.prototype = {
	initialize: function(){
		let Etip = document.createElement("p");
		Etip.textContent = "拖拽放入图片！最多"+this.$option.count+"张！";
		
		this.initEl(this.$option, Etip);
		this.forbidDocumentDrag();
		this.initElListen(this.$option.el, this.$option, Etip);
	},
	initEl: function(opt, Etip){
		opt.el.className += " lxyDrag";
		opt._cName = opt.el.className;
		this.$elAttr = this.getElAttr();
		opt.el.style.lineHeight = this.$elAttr.height + "px";
		if(opt.showTip) opt.el.appendChild(Etip);
	},
	loadCss: function(path){
		path = path.substr(0,path.lastIndexOf("/"))+"/css/lxyDrag.css";
		let link = document.createElement("link"), me = this;
		link.rel = "stylesheet";
		link.href = path;
		document.head.appendChild(link);
		link.onload = function(){
			me.initialize();
		}
	},
	forbidDocumentDrag: function(){
		["drop", "dragleave", "dragenter", "dragover"].forEach(function(event){
			root.document.addEventListener(event, function(e){
				e.preventDefault();
				return false;
			});
			root.addEventListener(event, function(e){
				e.preventDefault();
				return false;
			});
		});
	},
	initElListen: function(el, opt, Etip){
		el.addEventListener("click", function(e){
			let delE = e.target || srcElement;
			if(delE.className === "delThumb"){
				el.className = opt._cName;
				el.removeChild(delE.parentElement);
				opt._appendedCount = (--opt._appendedNums);
				if(opt._appendedNums === 0){
					opt.showTip = true;
					Etip.style.display = "inline-block";
				}
			}
		});
		el.addEventListener("dragenter", function(e){
			el.className += " active";
			if(opt.showTip) Etip.style.display = "none";
		});
		el.addEventListener("dragleave", function(e){
			el.className = opt._cName;
			if(opt.showTip) Etip.style.display = "inline-block";
		});
		el.addEventListener("drop", function(e){
			const MAXSIZE = opt.fileSize*1024*1024;
			let files = e.dataTransfer.files, frag, cache = {done:0, count:0};

			el.className = opt._cName;
			frag = document.createDocumentFragment();

			[].slice.call(files).filter(function(item, index){
				return (files[index].size < MAXSIZE && opt.fileType.indexOf(files[index].type.split("/")[1]) > -1);
			}).forEach(function(item, index, alls){
				if(opt._appendedCount++ >= opt.count){
					if(opt._appendedNums === opt.count) el.className += " full";
					return;
				};
				let reader = new FileReader(),
					Ediv = document.createElement("div"),
					Edel = document.createElement("span"),
					Eimg = document.createElement("img");

				opt.showTip = false;
				Ediv.className = "thumbBox";
				Edel.className = "delThumb";
				opt._appendedNums++;
				cache.count++;
				reader.addEventListener("load", function(){
					Eimg.src = reader.result;
					Ediv.appendChild(Eimg);
					Ediv.appendChild(Edel);
					frag.appendChild(Ediv);
					if( (++cache.done) === cache.count ){
						Etip.style.display = "none";
						el.appendChild(frag);
					};
				});
				reader.readAsDataURL(files[index]);
			});
		});
	},
	getElAttr: function(){
		let el = this.$option.el;
		return el.getBoundingClientRect();
	},
	getCurrAbsPath:(function(){
		var doc = root.document,
			a = {},
			expose = +new Date(),
			rExtractUri = /((?:http|https|file):\/\/.*?\/.:?[^:^\s]+)(?::\d+)?/,
			///((?:http|https|file):\/\/.*?\/.:?[^:^\s]+)(?::\d+)?/
			isLtIE8 = ('' + doc.querySelector).indexOf('[native code]') === -1;
		return function(){
			// FF,Chrome
			if (doc.currentScript){
				return doc.currentScript.src;
			}
			var stack;
			try{
				a.b();
			}
			catch(e){
				stack = e.fileName || e.sourceURL || e.stack || e.stacktrace;
				console.log(stack);
			}
			// IE10
			if (stack){
				var absPath = rExtractUri.exec(stack)[1];
				if (absPath){
					return absPath;
				}
			}
			// IE5-9
			for(var scripts = doc.scripts,
				i = scripts.length - 1,
				script; script = scripts[i--];){
				if (script.className !== expose && script.readyState === 'interactive'){
					script.className = expose;
					// if less than ie 8, must get abs path by getAttribute(src, 4)
					return isLtIE8 ? script.getAttribute('src', 4) : script.src;
				}
			}
		};
	})()(),
};

root.lxyDrag = lxyDrag;
})(window);
