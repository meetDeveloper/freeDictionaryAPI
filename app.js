var app = require("express")();
var cheerio = require("cheerio");
var request = require('request');
var path    = require("path");


function extend() {
    var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false,
        toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,
        push = Array.prototype.push,
        slice = Array.prototype.slice,
        trim = String.prototype.trim,
        indexOf = Array.prototype.indexOf,
        class2type = {
          "[object Boolean]": "boolean",
          "[object Number]": "number",
          "[object String]": "string",
          "[object Function]": "function",
          "[object Array]": "array",
          "[object Date]": "date",
          "[object RegExp]": "regexp",
          "[object Object]": "object"
        },
        jQuery = {
          isFunction: function (obj) {
            return jQuery.type(obj) === "function"
          },
          isArray: Array.isArray ||
          function (obj) {
            return jQuery.type(obj) === "array"
          },
          isWindow: function (obj) {
            return obj != null && obj == obj.window
          },
          isNumeric: function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj)
          },
          type: function (obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
          },
          isPlainObject: function (obj) {
            if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
              return false
            }
            try {
              if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false
              }
            } catch (e) {
              return false
            }
            var key;
            for (key in obj) {}
            return key === undefined || hasOwn.call(obj, key)
          }
        };
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
      }
      if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {}
      }
      if (length === i) {
        target = this;
        --i;
      }
      for (i; i < length; i++) {
        if ((options = arguments[i]) != null) {
          for (name in options) {
            src = target[name];
            copy = options[name];
            if (target === copy) {
              continue
            }
            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && jQuery.isArray(src) ? src : []
              } else {
                clone = src && jQuery.isPlainObject(src) ? src : {};
              }
              // WARNING: RECURSION
              target[name] = extend(deep, clone, copy);
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }
      return target;
    }
	
app.get("/", function(req, res){
    
   if(!req.query.define){
       res.sendFile(path.join(__dirname+'/welcome.html'));
   }  else {
       
        request({
        method: 'GET',
        url: 'https://www.google.co.in/search?q=define+' + req.query.define,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
        }
    }, function(err, response, body) {
        
        if(err){
            return console.error(err);
        }
        
        var dictionary = {};
    
            
        var $ = cheerio.load(body);

             dictionary.word = $("div.dDoNo span").first().text();
             dictionary.pronunciation = []
             $('.lr_dct_spkr.lr_dct_spkr_off audio').each(function(i, element){
                dictionary.pronunciation.push("https:" + $(this)[0].attribs.src); 
             });
            // dictionary.pronunciation = dictionary.pronunciation.replace('--_gb', '--_us');
             dictionary.phonetic = [];
             $(".lr_dct_ph.XpoqFe").each(function(i, element){
             	var pho = []
		$(this).find('span').each(function(i, element){
			pho.push($(this).text())
		});
                 dictionary.phonetic.push(pho); 

             });
             dictionary.meaning = {};

             
             if(dictionary.word.length < 1){
                 res.header("Access-Control-Allow-Origin", "*");
                 return res.status(404).sendFile(path.join(__dirname+'/404.html'));
             }
             
             var definitions = $(".lr_dct_ent.vmod.XpoqFe");
             
             var mainPart = definitions.first().find(".lr_dct_sf_h");
             
	     var origin = definitions.find(".vmod").first().next("div.xpdxpnd").text();
	     dictionary.origin = origin;
			
             var meaning = {};
			 			 
			 
             mainPart.each(function(i, element){
                 var type = $(this).text();
                 meaning[type] = [];
				 var alernaitions = $(this).next("div.xpdxpnd").first().text();
                 var selector = $(".lr_dct_sf_sens").eq(i).find("div[style='margin-left:20px'] > .PNlCoe");
				 
                 selector.each(function(ia, element){
                    var newDefinition = {};
                    newDefinition.definition = $(this).find("div[data-dobid='dfn']").text();
                    var example  = $(this).find("span.vmod .vk_gy").text();
                    var synonymsText = $(this).find("div.vmod td.lr_dct_nyms_ttl + td > span:not([data-log-string='synonyms-more-click'])").text();
                
                    var synonyms = synonymsText.split(/,|;/).filter(synonym => synonym!= ' ' && synonym).map(function(item) {
                                        return item.trim();
                                   });
                                   
                    if(example.length > 0)
                        newDefinition.example = example.substring(1, example.length - 1);               
                    
                    if(synonyms.length > 0)
                        newDefinition.synonyms = synonyms;
						
                    if(alernaitions.length > 0){
						if(ia == 0){
							var pts = alernaitions.split("; ");
							var alts = [];
							pts.forEach(function (ent){
								pt = ent.split(": ")
								alts.push([pt[0],pt[1]]);
							});

							newDefinition = extend({"alernaitions":alts}, newDefinition); 
							 meaning[type].push(newDefinition); 
						}else{
						 meaning[type].push(newDefinition); 
						}
					 }
                 });

             }) ;   
             
             dictionary.meaning = meaning;
             
              //console.log(dictionary.noun[0]);
              res.header("Content-Type",'application/json');
              res.header("Access-Control-Allow-Origin", "*");
              res.send(JSON.stringify(dictionary, null, 4));

         });
   }
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("I am listening...");
});
